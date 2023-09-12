import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { Checkbox } from '@/ui/input/components/Checkbox';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

const StyledLeftContentWithCheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type OwnProps = {
  LeftIcon?: IconComponent;
  selected: boolean;
  text: string;
  className: string;
  onSelectChange?: (selected: boolean) => void;
};

export function MenuItemMultiSelect({
  LeftIcon,
  text,
  selected,
  className,
  onSelectChange,
}: OwnProps) {
  function handleOnClick() {
    onSelectChange?.(!selected);
  }

  return (
    <StyledMenuItemBase className={className} onClick={handleOnClick}>
      <StyledLeftContentWithCheckboxContainer>
        <Checkbox checked={selected} />
        <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      </StyledLeftContentWithCheckboxContainer>
    </StyledMenuItemBase>
  );
}
