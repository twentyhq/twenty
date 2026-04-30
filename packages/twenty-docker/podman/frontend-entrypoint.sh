#!/bin/sh
set -e

if [ -n "${REACT_APP_SERVER_BASE_URL:-}" ]; then
  sed -i "s|REACT_APP_SERVER_BASE_URL: \".*\"|REACT_APP_SERVER_BASE_URL: \"${REACT_APP_SERVER_BASE_URL}\"|" /usr/share/nginx/html/index.html
fi

exec nginx -g 'daemon off;'
