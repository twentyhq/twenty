#!/bin/bash
# Injecting environment variables using a shell script allows the Front docker
# container to be parameterised at runtime, which means we can create a single
# Front container and point it at different backends as required.

echo "Generating env-config.js file..."

BASE_FILENAME="build/env-config.js"

# Recreate config file
rm -rf "./$BASE_FILENAME"
touch "./$BASE_FILENAME"

{
	echo "window._env_ = {"
	# Append configuration property to JS file
	echo "  REACT_APP_SERVER_BASE_URL: \"$REACT_APP_SERVER_BASE_URL\","

	echo "}"
} >> "./$BASE_FILENAME"