#!/bin/sh
echo "Generating env-config.js file from runtime environment variables..."

BASE_FILENAME="build/env-config.js"
mkdir -p build
rm -rf "./$BASE_FILENAME"

{
	echo "window._env_ = {"
	echo "  REACT_APP_SERVER_BASE_URL: \"$REACT_APP_SERVER_BASE_URL\","
	echo "}"
} > "./$BASE_FILENAME"
