import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { isDefined } from 'twenty-shared/utils';

type DetermineGraphColorModeParams = {
  configurationColor: string | null | undefined;
  selectFieldOptions: FieldMetadataItemOption[] | null | undefined;
};

export const determineGraphColorMode = ({
  configurationColor,
  selectFieldOptions,
}: DetermineGraphColorModeParams): GraphColorMode => {
  const hasExplicitColor =
    isDefined(configurationColor) && configurationColor !== 'auto';
  const hasSelectFieldOptions =
    isDefined(selectFieldOptions) && selectFieldOptions.length > 0;

  return hasExplicitColor
    ? 'explicitSingleColor'
    : hasSelectFieldOptions
      ? 'selectFieldOptionColors'
      : 'automaticPalette';
};
