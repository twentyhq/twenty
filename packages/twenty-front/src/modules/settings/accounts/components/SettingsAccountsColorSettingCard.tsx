import styled from '@emotion/styled';

import { ColorPickerButton } from '@/ui/input/button/components/ColorPickerButton';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import {
  MAIN_COLOR_NAMES,
  ThemeColor,
} from '@/ui/theme/constants/MainColorNames';

type SettingsAccountsColorSettingCardProps = {
  onChange: (nextValue: ThemeColor) => void;
  value: ThemeColor;
};

const StyledCardContent = styled(CardContent)`
  display: flex;
  padding: ${({ theme }) => theme.spacing(2, 4)};
  justify-content: space-between;
`;

export const SettingsAccountsColorSettingCard = ({
  onChange,
  value,
}: SettingsAccountsColorSettingCardProps) => (
  <Card>
    <StyledCardContent>
      {MAIN_COLOR_NAMES.map((colorName) => (
        <ColorPickerButton
          colorName={colorName}
          isSelected={value === colorName}
          onClick={() => onChange(colorName)}
        />
      ))}
    </StyledCardContent>
  </Card>
);
