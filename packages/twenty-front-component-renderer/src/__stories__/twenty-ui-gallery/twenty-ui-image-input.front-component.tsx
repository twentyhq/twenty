import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { ImageInput } from 'twenty-ui/components/input';
import { Button } from 'twenty-ui/primitives/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const IMAGE_SOURCE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="royalblue"/%3E%3C/svg%3E';
const INVALID_IMAGE_SOURCE = 'data:image/png;base64,invalid';

const ImageInputExample = () => {
  const [src, setSrc] = useState<string | undefined>(IMAGE_SOURCE);
  const [isUploading, setIsUploading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [uploads, setUploads] = useState(0);
  const [removals, setRemovals] = useState(0);
  const [aborts, setAborts] = useState(0);
  const [selectedFile, setSelectedFile] = useState('none');
  const [fileContents, setFileContents] = useState('none');
  const [isCallbackConnected, setIsCallbackConnected] = useState(true);
  const [revokedPreviewUrl, setRevokedPreviewUrl] = useState('none');

  useEffect(
    () => () => {
      if (src?.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    },
    [src],
  );

  const selectFile = async (file: File) => {
    setUploads((count) => count + 1);
    setSelectedFile(`${file.name}; ${file.type}; ${file.size} bytes`);
    try {
      const [text, buffer] = await Promise.all([
        file.text(),
        file.arrayBuffer(),
      ]);
      setFileContents(
        JSON.stringify({
          isFile: file instanceof File,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          text,
          bytes: Array.from(new Uint8Array(buffer)),
        }),
      );
      setSrc(URL.createObjectURL(file));
    } catch (error) {
      setFileContents(String(error));
    }
  };

  return (
    <TwentyUiGalleryCard title="ImageInput">
      <ImageInput
        accept="image/png, image/jpeg"
        render={<div role="group" aria-label="Profile image" />}
        src={src}
        isUploading={isUploading}
        disabled={disabled}
        helperText="Choose an image for your profile."
        errorMessage={errorMessage}
        uploadLabel="Choose profile image"
        removeLabel="Remove profile image"
        abortLabel="Cancel profile upload"
        onFileSelect={isCallbackConnected ? selectFile : undefined}
        onRemove={() => {
          setRemovals((count) => count + 1);
          setSrc(undefined);
        }}
        onAbort={() => {
          setAborts((count) => count + 1);
          setIsUploading(false);
        }}
      />
      <Button onClick={() => setSrc(IMAGE_SOURCE)}>Restore image</Button>
      <Button onClick={() => setSrc(INVALID_IMAGE_SOURCE)}>
        Show invalid image
      </Button>
      <Button onClick={() => setIsUploading(true)}>Start upload</Button>
      <Button
        onClick={() => setErrorMessage('The image could not be uploaded.')}
      >
        Show upload error
      </Button>
      <Button onClick={() => setErrorMessage(undefined)}>
        Clear upload error
      </Button>
      <Button onClick={() => setDisabled((value) => !value)}>
        {disabled ? 'Enable image input' : 'Disable image input'}
      </Button>
      <Button onClick={() => setIsCallbackConnected((value) => !value)}>
        {isCallbackConnected
          ? 'Disconnect file callback'
          : 'Connect file callback'}
      </Button>
      <Button
        onClick={() => {
          if (src?.startsWith('blob:')) {
            URL.revokeObjectURL(src);
            setRevokedPreviewUrl(src);
          }
        }}
      >
        Revoke preview URL
      </Button>
      <output aria-label="Revoked preview URL">{revokedPreviewUrl}</output>
      <output aria-label="File contents">{fileContents}</output>
      <output aria-label="Image actions">
        Uploads: {uploads}; Removals: {removals}; Aborts: {aborts}
      </output>
      <output aria-label="Selected image">{selectedFile}</output>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4c486527-2e46-4c7d-a0cc-d2f06d9c3a8e',
  name: 'twenty-ui-image-input',
  description: 'Image selection, preview, and actions in the sandbox',
  component: ImageInputExample,
});
