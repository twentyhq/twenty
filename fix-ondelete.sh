#!/bin/bash

set -e

cd /Users/felixmalfait/Projects/twenty2/packages/twenty-server

echo "Fixing onDelete decorator issues..."

# Fix files where @OneToMany has onDelete (should be @ManyToOne for single entity refs)
for file in \
  "src/engine/metadata-modules/object-permission/field-permission/field-permission.entity.ts" \
  "src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity.ts" \
  "src/engine/metadata-modules/view-field/entities/view-field.entity.ts" \
  "src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity.ts" \
  "src/engine/metadata-modules/view-filter/entities/view-filter.entity.ts" \
  "src/engine/metadata-modules/view-group/entities/view-group.entity.ts" \
  "src/engine/metadata-modules/view-sort/entities/view-sort.entity.ts" \
  "src/engine/metadata-modules/role/role-targets.entity.ts"; do

  if [ -f "$file" ]; then
    # Change @OneToMany with onDelete to @ManyToOne
    perl -i -0777 -pe 's/\@OneToMany\(\(\) => (\w+Entity), \{\s*onDelete: .CASCADE.,?\s*\}\)/@ManyToOne(() => $1, { onDelete: '\''CASCADE'\'' })/gs' "$file"
    echo "✓ Fixed $(basename $file)"
  fi
done

cd /Users/felixmalfait/Projects/twenty2
ERRORS=$(npx tsc --project packages/twenty-server/tsconfig.json --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo ""
echo "Current: $ERRORS errors ($((100 * (606 - ERRORS) / 606))% complete)"

