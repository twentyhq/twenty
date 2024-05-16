import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';

type LinksFieldDisplayProps = {
  isCellSoftFocused?: boolean;
  cellElement?: HTMLElement;
  fromTableCell?: boolean;
};

export const LinksFieldDisplay = ({
  isCellSoftFocused,
  cellElement,
  fromTableCell,
}: LinksFieldDisplayProps) => {
  const { fieldValue } = useLinksField();

  return (
    <LinksDisplay
      value={fieldValue}
      anchorElement={cellElement}
      isChipCountDisplayed={isCellSoftFocused}
      withExpandedListBorder={fromTableCell}
    />
  );
};
