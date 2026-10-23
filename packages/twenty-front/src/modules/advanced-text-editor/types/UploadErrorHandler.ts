export type UploadErrorHandler = ({
  error,
  file,
}: {
  error: Error;
  file: File;
}) => void;
