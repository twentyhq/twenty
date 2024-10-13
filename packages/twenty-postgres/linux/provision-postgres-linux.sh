#!/bin/sh

# Colors
RED=31
GREEN=32
BLUE=34

# Function to display colored output
echo_header () {
    COLOR=$1
    MESSAGE=$2
    echo "\e[${COLOR}m\n=======================================================\e[0m"
    echo "\e[${COLOR}m${MESSAGE}\e[0m"
    echo "\e[${COLOR}m=======================================================\e[0m"
}

# Function to handle errors
handle_error () {
    echo_header $RED "Error: $1"
    exit 1
}

read -p "This script uses sudo to install PostgreSQL, curl, and configure the system. Do you want to run this script? [y/N] " AGREEMENT

if ! echo "$AGREEMENT" | grep -iq "^y"; then
  exit 1
fi

cat << "EOF"
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@#*+=================@@@@@%*+=========++*%@@@@@@@
@@@@#-                   .+@@%=.                .+@@@@@
@@@-                   .*@@%-                     .#@@@
@@=     .=+++++++++++*#@@@=       -++++++++++-      %@@
@@.     %@@@@@@@@@@@@@@@+       =%@@@@@@@@@@@@=     +@@
@@.    .@@@@@@@@@@@@@@+.      -%@@@@@@@@@@@@@@+     +@@
@@.    .@@@@@@@@@@@@*.      -#@@#:=@@@@@@@@@@@=     +@@
@@      @@@@@@@@@@#:      :#@@#:  -@@@@@@@@@@@=     +@@
@@#====#@@@@@@@@#-      .*@@@=    -@@@@@@@@@@@=     +@@
@@@@@@@@@@@@@@%-      .*@@@@#     -@@@@@@@@@@@=     +@@
@@@@@@@@@@@@%=       +@@@@@@#     -@@@@@@@@@@@=     +@@
@@@@@@@@@@@+       =@@@@@@@@#     -@@@@@@@@@@@=     +@@
@@@@@@@@@+.      -%@@@@@@@@@#     -@@@@@@@@@@@=     +@@
@@@@@@@*.      -%@@@@@@@@@@@#     -@@@@@@@@@@@=     +@@
@@@@@#:      :#@@@@@@@@@@@@@#     -@@@@@@@@@@@+     +@@
@@@#:      :#@@@@@@@@@@@@@@@#     :@@@@@@@@@@@=     +@@
@@=       :+*+++++++++++*%@@@.     :+++++++++-      %@@
@@                       :@@@%.                   .#@@@
@@-                      :@@@@@+:               .+@@@@@
@@@#+===================+%@@@@@@@%*++=======++*%@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
EOF

echo_header $BLUE "                    DATABASE SETUP"

PG_MAIN_VERSION=15
PG_GRAPHQL_VERSION=1.5.6

if command -v dpkg &> /dev/null; then
    TARGETARCH=$(dpkg --print-architecture)
else
    TARGETARCH=$(uname -m)
fi

# Detect package manager and set up PostgreSQL and curl
if command -v dpkg &> /dev/null; then
    PACKAGE_MANAGER="dpkg"
elif command -v pacman &> /dev/null; then
    PACKAGE_MANAGER="pacman"
else
    handle_error "Unsupported package manager. This script only supports dpkg and pacman."
fi

# Installation for Debian/Ubuntu
if [ "$PACKAGE_MANAGER" = "dpkg" ]; then
    echo_header $GREEN "Step [1/4]: Installing PostgreSQL on Debian/Ubuntu..."
    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
    sudo apt update -y || handle_error "Failed to update package list."
    sudo apt install -y postgresql-$PG_MAIN_VERSION postgresql-contrib-$PG_MAIN_VERSION curl || handle_error "Failed to install PostgreSQL or curl."

    echo_header $GREEN "Step [2/4]: Installing GraphQL for PostgreSQL on Debian/Ubuntu..."
    curl -L https://github.com/supabase/pg_graphql/releases/download/v$PG_GRAPHQL_VERSION/pg_graphql-v$PG_GRAPHQL_VERSION-pg$PG_MAIN_VERSION-$TARGETARCH-linux-gnu.deb -o pg_graphql.deb || handle_error "Failed to download pg_graphql package."
    sudo dpkg --install pg_graphql.deb || handle_error "Failed to install pg_graphql package."
    rm pg_graphql.deb

    echo_header $GREEN "Step [3/4]: Starting PostgreSQL service..."
    if sudo service postgresql start; then
        echo "PostgreSQL service started successfully."
    else
        handle_error "Failed to start PostgreSQL service."
    fi

# Installation for Arch
elif [ "$PACKAGE_MANAGER" = "pacman" ]; then
    echo_header $GREEN "Step [1/4]: Installing PostgreSQL on Arch..."
    sudo pacman -Syu --noconfirm || handle_error "Failed to update package list."
    sudo pacman -S postgresql postgresql-libs curl --noconfirm || handle_error "Failed to install PostgreSQL or curl."

    echo_header $GREEN "Step [2/4]: Installing GraphQL for PostgreSQL on Arch..."
    if ! yay -S --noconfirm pg_graphql && ! paru -S --noconfirm pg_graphql; then
        handle_error "Failed to install pg_graphql package from AUR."
    fi

    echo_header $GREEN "Step [3/4]: Initializing and starting PostgreSQL service..."
    if sudo -u postgres sh -c 'test "$(ls -A /var/lib/postgres/data 2>/dev/null)"'; then
        echo "PostgreSQL data directory already contains data. Skipping initdb."
    else
    sudo -iu postgres initdb --locale en_US.UTF-8 -D /var/lib/postgres/data || handle_error "Failed to initialize PostgreSQL database."
    fi

    if [ "$(ps -p 1 -o comm=)" = "systemd" ]; then
        sudo systemctl enable postgresql
        sudo systemctl start postgresql || handle_error "Failed to start PostgreSQL service."
    else
        sudo mkdir -p /run/postgresql
        sudo chown postgres:postgres /run/postgresql
        sudo -iu postgres pg_ctl -D /var/lib/postgres/data -l /var/lib/postgres/logfile start || handle_error "Failed to start PostgreSQL service."
    fi
fi

# Run the init.sql to setup database
echo_header $GREEN "Step [4/4]: Setting up database..."
cp ./init.sql /tmp/init.sql
sudo -u postgres psql -f /tmp/init.sql || handle_error "Failed to execute init.sql script."
