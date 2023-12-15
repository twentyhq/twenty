import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  Attachment,
  AttachmentType,
} from '@/activities/files/types/Attachment';
import {
  IconFile,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconPresentation,
  IconTable,
  IconVideo,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

const StyledIconContainer = styled.div<{ background: string }>`
  align-items: center;
  background: ${({ background }) => background};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.grayScale.gray0};
  display: flex;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const IconMapping: { [key in AttachmentType]: IconComponent } = {
  Archive: IconFileZip,
  Audio: IconHeadphones,
  Image: IconPhoto,
  Presentation: IconPresentation,
  Spreadsheet: IconTable,
  TextDocument: IconFileText,
  Video: IconVideo,
  Other: IconFile,
};

export const AttachmentIcon = ({ attachment }: { attachment: Attachment }) => {
  const theme = useTheme();

  const IconColors: { [key in AttachmentType]: string } = {
    Archive: theme.color.gray,
    Audio: theme.color.pink,
    Image: theme.color.yellow,
    Presentation: theme.color.orange,
    Spreadsheet: theme.color.turquoise,
    TextDocument: theme.color.blue,
    Video: theme.color.purple,
    Other: theme.color.gray,
  };

  const Icon = IconMapping[attachment.type];

  return (
    <StyledIconContainer background={IconColors[attachment.type]}>
      {Icon && <Icon size={theme.icon.size.sm} />}
    </StyledIconContainer>
  );
};
