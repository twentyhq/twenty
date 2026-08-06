import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-29/constants/pre-2-29-standard-record-page-layout-universal-identifier-by-object-universal-identifier.constant';

// Standard record-page layouts added AFTER 2.29 are born on the derived
// scheme and need no pre-2.29 literal: list them here to keep the
// completeness check green.
const POST_2_28_RECORD_PAGE_KEYS: string[] = [];

describe('PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER', () => {
  // A missing entry would make the standard reconcile silently skip that
  // curated stack, and the backfill would then create a duplicate one.
  it('covers every pre-2.29 standard record-page layout', () => {
    const recordPageObjectNames = Object.keys(
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
    )
      .filter((key) => key.endsWith('RecordPage'))
      .filter((key) => !POST_2_28_RECORD_PAGE_KEYS.includes(key))
      .map((key) => key.slice(0, -'RecordPage'.length));

    expect(recordPageObjectNames.length).toBeGreaterThan(0);

    for (const objectName of recordPageObjectNames) {
      const objectUniversalIdentifier =
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS[
          objectName as keyof typeof STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS
        ];

      expect(objectUniversalIdentifier).toBeDefined();
      expect(
        PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER[
          objectUniversalIdentifier
        ],
      ).toBeDefined();
    }
  });

  it('holds no derived identifier: every literal predates the derivation', () => {
    const derivedLayoutUniversalIdentifiers = new Set(
      Object.values(STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS).map(
        (pageLayout) => pageLayout.universalIdentifier,
      ),
    );

    for (const pre228LayoutUniversalIdentifier of Object.values(
      PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER,
    )) {
      expect(
        derivedLayoutUniversalIdentifiers.has(pre228LayoutUniversalIdentifier),
      ).toBe(false);
    }
  });
});
