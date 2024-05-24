import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';

type LinksFieldDisplayProps = {
  isCellSoftFocused?: boolean;
  fromTableCell?: boolean;
};

export const LinksFieldDisplay = ({
  isCellSoftFocused,
  fromTableCell,
}: LinksFieldDisplayProps) => {
  const { fieldValue } = useLinksField();

  return (
    <LinksDisplay
      value={fieldValue}
      isChipCountDisplayed={isCellSoftFocused}
      withExpandedListBorder={fromTableCell}
    />
  );
};
