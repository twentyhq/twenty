#!/bin/bash

# Script to regenerate the Metadata API SDK
# Make sure the Twenty server is running on localhost:3000 before running this script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔄 Regenerating Twenty Metadata SDK..."
echo "📍 Output directory: $PACKAGE_DIR/src/generated/metadata"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/metadata > /dev/null 2>&1; then
  echo "❌ Error: Twenty server is not running on http://localhost:3000"
  echo "   Please start the server first:"
  echo "   npx nx run twenty-server:start"
  exit 1
fi

echo "✅ Server is running"
echo "🚀 Generating SDK..."
echo ""

# Run genql
cd "$PACKAGE_DIR"
npx genql --endpoint http://localhost:3000/metadata --output src/generated/metadata

echo ""
echo "✅ SDK regenerated successfully!"
echo "📦 Generated files in: src/generated/metadata/"
echo ""
echo "Next steps:"
echo "  1. Review the changes"
echo "  2. Rebuild the package: npx nx build twenty-sdk"

