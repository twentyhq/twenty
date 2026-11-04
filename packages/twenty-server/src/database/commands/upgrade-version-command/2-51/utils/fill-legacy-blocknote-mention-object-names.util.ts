import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject, parseJson } from 'twenty-shared/utils';

const fillMentionObjectName = ({
  value,
  objectNameSingularByObjectMetadataId,
}: {
  value: unknown;
  objectNameSingularByObjectMetadataId: Map<string, string>;
}): unknown => {
  if (
    !isPlainObject(value) ||
    value.type !== 'mention' ||
    !isPlainObject(value.props) ||
    isString(value.props.objectNameSingular) ||
    !isString(value.props.objectMetadataId)
  ) {
    return value;
  }

  const objectNameSingular = objectNameSingularByObjectMetadataId.get(
    value.props.objectMetadataId,
  );

  if (!isDefined(objectNameSingular)) {
    return value;
  }

  return { ...value, props: { ...value.props, objectNameSingular } };
};

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
    fillMentionObjectName({ value, objectNameSingularByObjectMetadataId }),
  );
};
