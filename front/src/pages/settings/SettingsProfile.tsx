import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { MainSectionTitle } from '@/ui/components/section-titles/MainSectionTitle';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { NoTopBarContainer } from '@/ui/layout/containers/NoTopBarContainer';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 490px;
`;
export function SettingsProfile() {
  const currentUser = useRecoilValue(currentUserState);
  return (
    <NoTopBarContainer>
      <StyledContainer>
        <MainSectionTitle>Profile</MainSectionTitle>
        <SubSectionTitle>Name</SubSectionTitle>
        <TextInput
          value={currentUser?.displayName}
          disabled
          fullWidth
          key={'id-' + currentUser?.id}
        />
        <SubSectionTitle>Email</SubSectionTitle>
        <TextInput
          value={currentUser?.email}
          disabled
          fullWidth
          key={'email-' + currentUser?.id}
        />
      </StyledContainer>
    </NoTopBarContainer>
  );
}
