import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewKey, ViewType } from 'twenty-shared/types';

import { remapRecordPageUniversalIdentifiersToPre228 } from 'src/database/commands/upgrade-version-command/2-10/utils/remap-record-page-universal-identifiers-to-pre-2-28.util';

describe('remapRecordPageUniversalIdentifiersToPre228', () => {
  it('should remap derived record-page universal identifiers to their pre-2.28 literals', () => {
    const remapped = remapRecordPageUniversalIdentifiersToPre228({
      universalIdentifier:
        STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields
          .universalIdentifier,
      nested: {
        viewUniversalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields
            .universalIdentifier,
      },
    });

    expect(remapped).toEqual({
      universalIdentifier: '99fa8b47-3b11-4f9b-8fbc-e67a9e1da682',
      nested: {
        viewUniversalIdentifier: 'c73668d1-022d-4eaf-b825-4e2548180db6',
      },
    });
  });

  it('should downgrade the FIELDS_WIDGET view key to the pre-2.28 null shape without touching the view type', () => {
    const remapped = remapRecordPageUniversalIdentifiersToPre228({
      key: ViewKey.FIELDS_WIDGET,
      type: ViewType.FIELDS_WIDGET,
      name: 'Call Recording Record Page Fields',
    });

    expect(remapped).toEqual({
      key: null,
      type: ViewType.FIELDS_WIDGET,
      name: 'Call Recording Record Page Fields',
    });
  });

  it('should leave INDEX view keys and unrelated identifiers untouched', () => {
    const input = {
      key: ViewKey.INDEX,
      universalIdentifier: '11111111-1111-4111-8111-111111111111',
    };

    expect(remapRecordPageUniversalIdentifiersToPre228(input)).toEqual(input);
  });
});
