#!/bin/sh

set -e

echo "==> Packaging Twenty Desktop..."
SKIP_SIGN=1 npx electron-forge package

echo "==> Ad-hoc signing Twenty.app..."
codesign --force --deep --sign - out/Twenty-darwin-arm64/Twenty.app

echo "==> Starting local server..."
node src/server.js &
SERVER_PID=$!

trap "echo '==> Stopping server...'; kill $SERVER_PID 2>/dev/null" EXIT INT TERM

echo "==> Launching Twenty.app..."
./out/Twenty-darwin-arm64/Twenty.app/Contents/MacOS/Twenty
