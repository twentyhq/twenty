import { getFileType } from '@/activities/files/utils/getFileType';
import { FileIcon } from '@/file/components/FileIcon';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconComponent,
  IconFile,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconPresentation,
  IconTable,
  IconVideo,
} from 'twenty-ui/display';
import { File as FileDocument } from '~/generated-metadata/graphql';
import { AvatarChip, ChipVariant } from 'twenty-ui/components';
import { AttachmentType } from '@/activities/files/types/Attachment';

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

export const AgentChatFilePreview = ({
  file,
  onRemove,
  isUploading,
}: {
  file: File | FileDocument;
  onRemove?: () => void;
  isUploading?: boolean;
}) => {
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

  return (
    <AvatarChip
      name={file.name}
      LeftIcon={IconMapping[getFileType(file.name)]}
      LeftIconBackgroundColor={IconColors[getFileType(file.name)]}
      variant={ChipVariant.Static}
    />
  );

  // return (
  //   <StyledFileChip key={file.name}>
  //     <StyledFileIconContainer>
  //       {isUploading ? (
  //         <Loader color="yellow" />
  //       ) : (
  //         <FileIcon fileType={getFileType(file.name)} />
  //       )}
  //     </StyledFileIconContainer>
  //     <StyledFileInfo>
  //       <StyledFileName title={file.name}>{file.name}</StyledFileName>
  //       <StyledFileSize>{formatFileSize(file.size)}</StyledFileSize>
  //     </StyledFileInfo>
  //     {onRemove && (
  //       <StyledRemoveIconContainer>
  //         <IconX
  //           size={theme.icon.size.md}
  //           color={theme.font.color.secondary}
  //           onClick={onRemove}
  //         />
  //       </StyledRemoveIconContainer>
  //     )}
  //   </StyledFileChip>
  // );
};
