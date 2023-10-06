#!/bin/bash

# Colors
RED=31
GREEN=32
BLUE=34

# Function to display colored output
function echo_header {
    COLOR=$1
    MESSAGE=$2
    echo -e "\e[${COLOR}m\n=======================================================\e[0m"
    echo -e "\e[${COLOR}m${MESSAGE}\e[0m"
    echo -e "\e[${COLOR}m=======================================================\e[0m"
}

# Function to handle errors
function handle_error {
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

PG_MAIN_VERSION=14
PG_GRAPHQL_VERSION=1.3.0
TARGETARCH=$(dpkg --print-architecture)

# Install PostgresSQL
echo_header $GREEN "Step [1/4]: Installing PostgreSQL..."
apt update -y || handle_error "Failed to update package list."
apt install -y postgresql-$PG_MAIN_VERSION postgresql-contrib || handle_error "Failed to install PostgreSQL."
apt install -y curl || handle_error "Failed to install curl."

# Install pg_graphql extensions
echo_header $GREEN "Step [2/4]: Installing GraphQL for PostgreSQL..."
curl -L https://github.com/supabase/pg_graphql/releases/download/v$PG_GRAPHQL_VERSION/pg_graphql-v$PG_GRAPHQL_VERSION-pg$PG_MAIN_VERSION-$TARGETARCH-linux-gnu.deb -o pg_graphql.deb || handle_error "Failed to download pg_graphql package."
dpkg --install pg_graphql.deb || handle_error "Failed to install pg_graphql package."
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
sudo -u postgres psql -f ../postgres/init.sql || handle_error "Failed to execute init.sql script."
