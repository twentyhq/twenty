import { useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/data-display';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

const PROVENANCE_TAG_COLOR = {
  [MetadataTranslationProvenance.WORKSPACE]: 'blue',
  [MetadataTranslationProvenance.SHIPPED]: 'green',
  [MetadataTranslationProvenance.INHERITED]: 'gray',
} as const;

export const MetadataTranslationProvenanceTag = ({
  provenance,
}: {
  provenance: MetadataTranslationProvenance;
}) => {
  const { t } = useLingui();

  const provenanceLabels = {
    [MetadataTranslationProvenance.WORKSPACE]: t`Custom`,
    [MetadataTranslationProvenance.SHIPPED]: t`Twenty`,
    [MetadataTranslationProvenance.INHERITED]: t`Inherited`,
  };

  return (
    <Tag
      color={PROVENANCE_TAG_COLOR[provenance]}
      text={provenanceLabels[provenance]}
      weight="medium"
    />
  );
};
