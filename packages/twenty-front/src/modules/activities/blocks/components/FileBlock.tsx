import { createReactBlockSpec } from '@blocknote/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type ChangeEvent, useRef } from 'react';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { getFileType } from '@/activities/files/utils/getFileType';
import { FileIcon } from '@/file/components/FileIcon';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';

const StyledFileInput = styled.input`
  display: none;
`;

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

export const FileBlock = createReactBlockSpec(
  {
    type: 'file',
    propSchema: {
      url: {
        default: '' as string,
      },
      name: {
        default: '' as string,
      },
      fileCategory: {
        default: 'OTHER' as AttachmentFileCategory,
      },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const inputFileRef = useRef<HTMLInputElement>(null);

      const handleUploadAttachment = async (file: File) => {
        if (isUndefinedOrNull(file)) {
          return '';
        }
        const fileUrl = await editor.uploadFile?.(file);

        if (!isNonEmptyString(fileUrl)) {
          return '';
        }

        editor.updateBlock(block.id, {
          props: {
            ...block.props,
            ...{
              url: fileUrl,
              fileCategory: getFileType(file.name),
              name: file.name,
            },
          },
        });
      };
      const handleUploadFileClick = () => {
        inputFileRef?.current?.click?.();
      };
      const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (isDefined(e.target.files))
          handleUploadAttachment?.(e.target.files[0]);
      };

      if (isNonEmptyString(block.props.url)) {
        return (
          <StyledFileLine>
            <FileIcon
              fileCategory={block.props.fileCategory as AttachmentFileCategory}
            />
            <StyledLink href={block.props.url} target="__blank">
              {block.props.name}
            </StyledLink>
          </StyledFileLine>
        );
      }

      return (
        <StyledUploadFileContainer>
          <StyledFileInput
            ref={inputFileRef}
            onChange={handleFileChange}
            type="file"
          />
          <Button
            onClick={handleUploadFileClick}
            title={t`Upload File`}
          ></Button>
        </StyledUploadFileContainer>
      );
    },
  },
);
