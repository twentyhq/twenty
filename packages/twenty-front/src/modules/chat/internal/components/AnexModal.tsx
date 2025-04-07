/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/display';
import { ChatContext } from '../context/chatContext';
import { ChatContextType } from '../types/chat';

const StyledMainContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  bottom: 50px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 180px;
`;

interface LabelProps {
  isImage?: boolean;
}

const StyledLabel = styled.label<LabelProps>`
  display: flex;
  padding: 6px 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.secondary};
  border-top-right-radius: ${({ theme, isImage }) =>
    isImage ? theme.border.radius.md : 0};
  border-top-left-radius: ${({ theme, isImage }) =>
    isImage ? theme.border.radius.md : 0};
  border-bottom-right-radius: ${({ theme, isImage }) =>
    isImage ? 0 : theme.border.radius.md};
  border-bottom-left-radius: ${({ theme, isImage }) =>
    isImage ? 0 : theme.border.radius.md};

  &:hover {
    background-color: ${({ theme }) => theme.background.quaternary};
  }
`;

const StyledInput = styled.input`
  display: none;
`;

export const AnexModal = () => {
  const { getIcon } = useIcons();
  const theme = useTheme();

  const DocIcon = getIcon('IconFile');
  const ImageIcon = getIcon('IconCamera');
  const VideoIcon = getIcon('IconVideo');

  const { uploadFile, setIsAnexOpen } = useContext(
    ChatContext,
  ) as ChatContextType;

  return (
    <StyledMainContainer>
      <StyledLabel
        isImage
        style={{
          borderBottom: `1px solid ${theme.border.color.medium}`,
        }}
      >
        <ImageIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.primary}
          style={{ marginRight: theme.spacing(2) }}
        />
        Image
        <StyledInput
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadFile(file, 'img');
              setIsAnexOpen(false);
            }
          }}
        />
      </StyledLabel>
      <StyledLabel
        isImage
        style={{
          borderBottom: `1px solid ${theme.border.color.medium}`,
        }}
      >
        <VideoIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.primary}
          style={{ marginRight: theme.spacing(2) }}
        />
        Video
        <StyledInput
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadFile(file, 'video');
              setIsAnexOpen(false);
            }
          }}
        />
      </StyledLabel>
      <StyledLabel>
        <DocIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.primary}
          style={{ marginRight: theme.spacing(2) }}
        />
        Document
        <StyledInput
          type="file"
          accept=".pdf, .doc, .docx, .txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadFile(file, 'doc');
              setIsAnexOpen(false);
            }
          }}
        />
      </StyledLabel>
    </StyledMainContainer>
  );
};
