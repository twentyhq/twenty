import { useLingui } from '@lingui/react/macro';

export const useTranslatablePropertyLabel = () => {
  const { t } = useLingui();

  const labelsByMetadataName: Record<string, Record<string, string>> = {
    objectMetadata: {
      labelSingular: t`Label (singular)`,
      labelPlural: t`Label (plural)`,
      description: t`Description`,
    },
    fieldMetadata: {
      label: t`Label`,
      description: t`Description`,
    },
  };

  const getPropertyLabel = ({
    metadataName,
    property,
  }: {
    metadataName: string;
    property: string;
  }): string => labelsByMetadataName[metadataName]?.[property] ?? property;

  return { getPropertyLabel };
};
