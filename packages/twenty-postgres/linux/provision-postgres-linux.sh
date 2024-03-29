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
PG_GRAPHQL_VERSION=1.5.1
TARGETARCH=$(dpkg --print-architecture)

# Install PostgresSQL
echo_header $GREEN "Step [1/4]: Installing PostgreSQL..."
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
sudo apt update -y || handle_error "Failed to update package list."
sudo apt install -y postgresql-$PG_MAIN_VERSION postgresql-contrib || handle_error "Failed to install PostgreSQL."su
sudo apt install -y curl || handle_error "Failed to install curl."

# Install pg_graphql extensions
echo_header $GREEN "Step [2/4]: Installing GraphQL for PostgreSQL..."
curl -L https://github.com/supabase/pg_graphql/releases/download/v$PG_GRAPHQL_VERSION/pg_graphql-v$PG_GRAPHQL_VERSION-pg$PG_MAIN_VERSION-$TARGETARCH-linux-gnu.deb -o pg_graphql.deb || handle_error "Failed to download pg_graphql package."
sudo dpkg --install pg_graphql.deb || handle_error "Failed to install pg_graphql package."
rm pg_graphql.deb

# Start postgresql service
echo_header $GREEN "Step [3/4]: Starting PostgreSQL service..."
if sudo service postgresql start; then
    echo "PostgreSQL service started successfully."
else
    handle_error "Failed to start PostgreSQL service."
fi

# Run the init.sql to setup database
echo_header $GREEN "Step [4/4]: Setting up database..."
cp ./init.sql /tmp/init.sql
sudo -u postgres psql -f /tmp/init.sql || handle_error "Failed to execute init.sql script."
