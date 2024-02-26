import { ChangeEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings, IconUpload, IconPlus, IconFile,IconVideo, IconPhoto} from '@/ui/display/icon';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { TextArea, TextInput } from 'tsup.ui.index';
import { Button } from '@/ui/input/button/components/Button';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageBody } from '@/ui/layout/page/PageBody';


const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const StyledAttachmentsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

const StyledFileInput = styled.input`
  display: none;
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
const StyledButtonContainer = styled.div`
  width: auto;
  align-self: flex-start;
`;

export const DocumentTemplate = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      onUploadFile(file);
    }  };

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };

  const [bodyDescription, setBodyDescription] = useState('');
  const [footerText, setFooterText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onUploadFile = async (file: File) => {
    console.log("Uploading file:", file);
    const resp = await uploadAttachmentFile(file, targetableObject);
    console.log("resp", resp)
    setUploadedFile(file);
  };


  const attachmentIcon = (fileName:string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension){
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx':
        return <IconFile />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <IconPhoto />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <IconVideo />
      case 'mp3':
      case 'wav':
      case 'ogg':
        return < IconPhoto />
      default:
        return <IconFile />
      
    }
  }
 
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Templates">
      <SettingsPageContainer>
        <StyledH1Title title="Templates" />
        
        <Section>
          <H2Title title="Header" />

          <StyledComboInputContainer>
              <StyledAttachmentsContainer>
                <StyledFileInput
                  ref={inputFileRef}
                  onChange={handleFileChange}
                  type="file"
                />
                <StyledButtonContainer>
                  <Button
                    Icon={IconPlus}
                    size="small"
                    variant="secondary"
                    title="Upload file"
                    onClick={handleUploadFileClick}
                  />
                </StyledButtonContainer>
              </StyledAttachmentsContainer>
             
            </StyledComboInputContainer>
            {uploadedFile && (
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 0, marginTop:'20px' }}>
                {attachmentIcon(uploadedFile.name)}
                <span style={{ marginLeft: '4px' }}>{uploadedFile.name}</span>
              </div>
            )}

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