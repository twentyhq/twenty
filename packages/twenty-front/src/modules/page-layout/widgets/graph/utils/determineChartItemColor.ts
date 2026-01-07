import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { GRAPH_COLORS } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getSelectOptionColorForValue } from '@/page-layout/widgets/graph/utils/getSelectOptionColorForValue';
import { isDefined } from 'twenty-shared/utils';

type DetermineChartItemColorParams = {
  configurationColor: GraphColor | null | undefined;
  isSelectField: boolean;
  selectOptions: FieldMetadataItemOption[] | null | undefined;
  rawValue: string | null | undefined;
  index: number;
};

export const determineChartItemColor = ({
  configurationColor,
  isSelectField,
  selectOptions,
  rawValue,
  index,
}: DetermineChartItemColorParams): GraphColor => {
  if (isDefined(configurationColor) && configurationColor !== 'auto') {
    return configurationColor;
  }

  if (isSelectField && isDefined(selectOptions)) {
    const optionColor = getSelectOptionColorForValue({
      rawValue,
      selectOptions,
    });
    if (isDefined(optionColor)) {
      return optionColor;
    }
  }

  return GRAPH_COLORS[index % GRAPH_COLORS.length];
};
