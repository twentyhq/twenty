import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject, parseJson } from 'twenty-shared/utils';

export const fillLegacyBlockNoteMentionObjectNames = ({
  serializedBlockNote,
  objectNameSingularByObjectMetadataId,
}: {
  serializedBlockNote: string;
  objectNameSingularByObjectMetadataId: Map<string, string>;
}): string => {
  const blocks = parseJson<unknown>(serializedBlockNote);

  if (!isDefined(blocks)) {
    return serializedBlockNote;
  }

  return JSON.stringify(blocks, (_key, value: unknown) =>
    isPlainObject(value) &&
    value.type === 'mention' &&
    isPlainObject(value.props) &&
    !isString(value.props.objectNameSingular) &&
    isString(value.props.objectMetadataId)
      ? {
          ...value,
          props: {
            ...value.props,
            objectNameSingular: objectNameSingularByObjectMetadataId.get(
              value.props.objectMetadataId,
            ),
          },
        }
      : value,
  );
};
