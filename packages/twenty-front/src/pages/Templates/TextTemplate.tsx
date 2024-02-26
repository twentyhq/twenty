import { useState } from 'react';
import styled from '@emotion/styled';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings, IconUpload } from '@/ui/display/icon';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { TextArea, TextInput } from 'tsup.ui.index';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import { useUploadProfilePictureMutation } from '~/generated/graphql';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const TextTemplate = () => {
  const [uploadPicture] = useUploadProfilePictureMutation();
  const [headerText, setHeaderText] = useState('');
  const [bodyDescription, setBodyDescription] = useState('');
  const [footerText, setFooterText] = useState('');

  const handleUpload = async (file: File) => {
    if (!file) return;

    try {
      const result = await uploadPicture({ variables: { file } });
      return result;
    } catch (error) {
      console.error('An error occurred while uploading the picture:', error);
    }
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Templates">
      <SettingsPageContainer>
        <StyledH1Title title="Templates" />
        
        <Section>
          <H2Title title="Header" />

          <TextInput
              label="Text"
              value={headerText}
              onChange={setHeaderText}
              placeholder="Add a title for this header"
              fullWidth
            />
        </Section>
        
        <Section>
          <H2Title title="Body" />
          <TextArea
            placeholder="Add the content of the message"
            value={bodyDescription}
            onChange={setBodyDescription}
            minRows={4}
          />
        </Section>
        <StyledInputsContainer>
          <Section>
            <H2Title title="Footer" />
            <TextInput
              label="Footer"
              value={footerText}
              onChange={setFooterText}
              placeholder="Add a short line of text to the bottom of your message template"
              fullWidth
            />
          </Section>
        </StyledInputsContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
