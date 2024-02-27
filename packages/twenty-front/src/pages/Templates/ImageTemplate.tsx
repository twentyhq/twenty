import { ChangeEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { TextArea, TextInput } from 'tsup.ui.index';
import { Button } from '@/ui/input/button/components/Button';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useMutation } from '@apollo/client';
import { UPLOAD_FILE } from '../../modules/files/graphql/queries/uploadFile.ts'; 
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconSettings } from '@/ui/display/icon';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const ImageTemplate = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const [bodyDescription, setBodyDescription] = useState('');
  const [footerText, setFooterText] = useState('');
  const [file, setFile] = useState<File | null>(null); 
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadFileMutation] = useMutation(UPLOAD_FILE);
  const { enqueueSnackBar } = useSnackBar();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0]; 
    setFile(selectedFile || null); 

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    try {
      if (!file) return; 
      const { data } = await uploadFileMutation({
        variables: {
          file,
          fileFolder: 'Attachment', 
        },
      });
      console.log('File uploaded successfully:', data);
      enqueueSnackBar('Uploaded Sucessfullly!',{
        variant: 'success',
      });
    } catch (errors: any) {
      console.error('Error uploading file:', errors);
            enqueueSnackBar(errors.message + ' Error uploading file:',{
        variant: 'error',
      });

    }
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Templates">
      <SettingsPageContainer>
        <StyledH1Title title="Templates" />
        <Section>
          <H2Title title="Header" />
            <div>
              <input type="file" onChange={handleFileChange} accept="image/*"/>
              {imagePreviewUrl && <StyledImagePreview src={imagePreviewUrl} alt="Preview" />}
            </div>
        </Section>
        <Section>
            <Button
              title="Upload"
              variant="primary"
              accent="blue"
              size="medium"
              onClick={handleUpload}
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
