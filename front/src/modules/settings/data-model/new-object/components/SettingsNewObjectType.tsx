import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconBox, IconDatabase, IconFileCheck } from '@/ui/display/icon';

import { SettingsObjectTypeCard } from './SettingsObjectTypeCard';
import { SettingsStandardObjects } from './SettingsStandardObjects';

export type NewObjectType = 'Standard' | 'Custom' | 'Remote';

type SettingsNewObjectTypeProps = {
  selectedType?: NewObjectType;
  onTypeSelect?: (type: NewObjectType) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: 32px;
  width: 100%;
`;
const STANDARD_OBJECT_TYPE = 'Standard';
export const SettingsNewObjectType = ({
  selectedType = STANDARD_OBJECT_TYPE,
  onTypeSelect,
}: SettingsNewObjectTypeProps) => {
  const theme = useTheme();
  return (
    <>
      <StyledContainer>
        <SettingsObjectTypeCard
          title={STANDARD_OBJECT_TYPE}
          color="blue"
          selected={selectedType === STANDARD_OBJECT_TYPE}
          prefixIcon={
            <IconFileCheck
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.tertiary}
            />
          }
          onClick={() => onTypeSelect?.('Standard')}
        />
        <SettingsObjectTypeCard
          title="Custom"
          color="orange"
          selected={selectedType === 'Custom'}
          prefixIcon={
            <IconBox
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.tertiary}
            />
          }
          onClick={() => onTypeSelect?.('Custom')}
        />
        <SettingsObjectTypeCard
          title="Remote"
          soon
          disabled
          color="green"
          selected={selectedType === 'Remote'}
          prefixIcon={
            <IconDatabase
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.tertiary}
            />
          }
        />
      </StyledContainer>
      {selectedType === STANDARD_OBJECT_TYPE && <SettingsStandardObjects />}
    </>
  );
};
