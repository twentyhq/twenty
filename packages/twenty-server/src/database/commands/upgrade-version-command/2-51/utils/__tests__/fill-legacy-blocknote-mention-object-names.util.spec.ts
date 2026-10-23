import { fillLegacyBlockNoteMentionObjectNames } from 'src/database/commands/upgrade-version-command/2-51/utils/fill-legacy-blocknote-mention-object-names.util';

const PERSON_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000001';

const fillMentionProps = (mentionProps: Record<string, unknown>) =>
  JSON.parse(
    fillLegacyBlockNoteMentionObjectNames({
      serializedBlockNote: JSON.stringify([
        {
          id: 'block-1',
          type: 'paragraph',
          props: {},
          content: [{ type: 'mention', props: mentionProps }],
          children: [],
        },
      ]),
      objectNameSingularByObjectMetadataId: new Map([
        [PERSON_OBJECT_METADATA_ID, 'person'],
      ]),
    }),
  )[0].content[0].props;

describe('fillLegacyBlockNoteMentionObjectNames', () => {
  it('should resolve the object of a legacy mention from its object metadata id', () => {
    expect(
      fillMentionProps({ objectMetadataId: PERSON_OBJECT_METADATA_ID }),
    ).toEqual({
      objectMetadataId: PERSON_OBJECT_METADATA_ID,
      objectNameSingular: 'person',
    });
  });

  it('should keep the object name a mention already stores', () => {
    expect(
      fillMentionProps({
        objectMetadataId: PERSON_OBJECT_METADATA_ID,
        objectNameSingular: 'company',
      }).objectNameSingular,
    ).toBe('company');
  });

  it('should leave the object empty when the legacy object no longer exists', () => {
    expect(
      fillMentionProps({
        objectMetadataId: '20202020-0000-4000-8000-000000000003',
      }),
    ).toEqual({ objectMetadataId: '20202020-0000-4000-8000-000000000003' });
  });

  it('should return values that are not JSON untouched', () => {
    expect(
      fillLegacyBlockNoteMentionObjectNames({
        serializedBlockNote: 'not json',
        objectNameSingularByObjectMetadataId: new Map(),
      }),
    ).toBe('not json');
  });
});
