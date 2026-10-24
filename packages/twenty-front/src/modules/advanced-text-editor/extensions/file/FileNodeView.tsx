import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { type ChangeEvent, useRef } from 'react';
import { getSafeUrl, isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { getFileType } from '@/activities/files/utils/getFileType';
import { isImageFile } from '@/advanced-text-editor/utils/isImageFile';
import { FileIcon } from '@/file/components/FileIcon';

const StyledFileLine = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  text-decoration: none;

  &:hover {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const StyledUploadingFileName = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledFileInput = styled.input`
  display: none;
`;

type FileNodeViewProps = NodeViewProps;

export const FileNodeView = ({
  node,
  editor,
  getPos,
  updateAttributes,
}: FileNodeViewProps) => {
  // oxlint-disable-next-line twenty/no-state-useref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { onFileUpload, onFileUploadError } = editor.extensionStorage.upload;

  const safeUrl = getSafeUrl(node.attrs.url);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!isDefined(file) || !isDefined(onFileUpload)) {
      return;
    }

    const uploadedFile = await onFileUpload(file).catch((error: Error) => {
      onFileUploadError?.({ error, file });

      return undefined;
    });
    const position = getPos();

    if (!isDefined(uploadedFile) || !isDefined(position)) {
      return;
    }

    if (isImageFile(file)) {
      editor
        .chain()
        .insertContentAt(
          { from: position, to: position + node.nodeSize },
          {
            type: TIPTAP_NODE_TYPES.IMAGE,
            attrs: { src: uploadedFile.url, alt: file.name },
          },
        )
        .run();

      return;
    }

    updateAttributes({ url: uploadedFile.url, name: file.name });
  };

  if (node.attrs.url.startsWith('blob:')) {
    return (
      <NodeViewWrapper>
        <StyledFileLine contentEditable={false}>
          <FileIcon fileCategory={getFileType(node.attrs.name)} />
          <StyledUploadingFileName>{node.attrs.name}</StyledUploadingFileName>
        </StyledFileLine>
      </NodeViewWrapper>
    );
  }

  if (isDefined(safeUrl)) {
    return (
      <NodeViewWrapper>
        <StyledFileLine contentEditable={false}>
          <FileIcon
            fileCategory={getFileType(node.attrs.name)}
            thumbnailUrl={safeUrl}
          />
          <StyledLink href={safeUrl} target="_blank" rel="noopener noreferrer">
            {node.attrs.name}
          </StyledLink>
        </StyledFileLine>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <StyledFileLine contentEditable={false}>
        <StyledFileInput
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
        />
        <Button
          disabled={!isDefined(onFileUpload) || !editor.isEditable}
          onClick={() => fileInputRef.current?.click()}
        >{t`Upload File`}</Button>
      </StyledFileLine>
    </NodeViewWrapper>
  );
};
