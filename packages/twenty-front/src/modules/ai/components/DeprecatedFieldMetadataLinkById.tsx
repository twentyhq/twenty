import { FieldMetadataChip } from '@/ai/components/FieldMetadataChip';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { isDefined } from 'twenty-shared/utils';

type DeprecatedFieldMetadataLinkByIdProps = {
  fieldMetadataItemId: string;
  displayName: string;
};

/**
 * @deprecated Renders field references persisted with the old id-based syntax
 * (`[[field:<uuid>:<label>]]`). New messages address fields by object and field
 * name, handled by `FieldMetadataLink`.
 *
 * Kept only so already-persisted chat messages keep rendering.
 * Delete after 2026 september, along with the `legacyFieldById` reference kind.
 */
export const DeprecatedFieldMetadataLinkById = ({
  fieldMetadataItemId,
  displayName,
}: DeprecatedFieldMetadataLinkByIdProps) => {
  const target = useChatReferenceTarget({
    kind: 'legacyFieldById',
    fieldMetadataItemId,
  });

  if (!isDefined(target.fieldMetadataItem)) {
    return <span>{displayName}</span>;
  }

  return (
    <FieldMetadataChip
      displayName={displayName}
      target={target}
      fieldMetadataItem={target.fieldMetadataItem}
    />
  );
};
