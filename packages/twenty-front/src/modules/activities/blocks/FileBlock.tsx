import { ChangeEvent, useRef } from 'react';
import {
  BlockFromConfig,
  BlockNoteEditor,
  InlineContentSchema,
  PropSchema,
  StyleSchema,
} from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import styled from '@emotion/styled';

import { Button } from '@/ui/input/button/components/Button';
import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';

import { AttachmentIcon } from '../files/components/AttachmentIcon';
import { AttachmentType } from '../files/types/Attachment';
import { getFileType } from '../files/utils/getFileType';

import { blockSpecs } from './blockSpecs';

export const filePropSchema = {
  // File url
  url: {
    default: '' as string,
  },
  name: {
    default: '' as string,
  },
  fileType: {
    default: 'Other' as AttachmentType,
  },
} satisfies PropSchema;

const StyledFileInput = styled.input`
  display: none;
`;

const FileBlockConfig = {
  type: 'file' as const,
  propSchema: filePropSchema,
  content: 'none' as const,
};

const StyledFileLine = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  text-decoration: none;
  :hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledUploadFileContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const FileBlockRenderer = ({
  block,
  editor,
}: {
  block: BlockFromConfig<
    typeof FileBlockConfig,
    InlineContentSchema,
    StyleSchema
  >;
  editor: BlockNoteEditor<typeof blockSpecs, InlineContentSchema, StyleSchema>;
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUploadAttachment = async (file: File) => {
    if (!file) {
      return '';
    }
    const fileUrl = await editor.uploadFile?.(file);

    editor.updateBlock(block.id, {
      props: {
        ...block.props,
        ...{ url: fileUrl, fileType: getFileType(file.name), name: file.name },
      },
    });
  };
  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleUploadAttachment?.(e.target.files[0]);
  };

  if (block.props.url) {
    return (
      <AppThemeProvider>
        <StyledFileLine>
          <AttachmentIcon
            attachmentType={block.props.fileType as AttachmentType}
          ></AttachmentIcon>
          <StyledLink href={block.props.url} target="__blank">
            {block.props.name}
          </StyledLink>
        </StyledFileLine>
      </AppThemeProvider>
    );
  }

  return (
    <AppThemeProvider>
      <StyledUploadFileContainer>
        <StyledFileInput
          ref={inputFileRef}
          onChange={handleFileChange}
          type="file"
        />
        <Button onClick={handleUploadFileClick} title="Upload File"></Button>
      </StyledUploadFileContainer>
    </AppThemeProvider>
  );
};

export const FileBlock = createReactBlockSpec(FileBlockConfig, {
  render: (block) => {
    return (
      <FileBlockRenderer
        block={block.block}
        editor={block.editor}
      ></FileBlockRenderer>
    );
  },
});
