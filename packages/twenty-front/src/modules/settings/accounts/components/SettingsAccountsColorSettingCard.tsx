import styled from '@emotion/styled';

import { ColorPickerButton } from '@/ui/input/button/components/ColorPickerButton';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { mainColorNames, ThemeColor } from '@/ui/theme/constants/colors';

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
      {mainColorNames.map((colorName) => (
        <ColorPickerButton
          colorName={colorName}
          isSelected={value === colorName}
          onClick={() => onChange(colorName)}
        />
      ))}
    </StyledCardContent>
  </Card>
);
