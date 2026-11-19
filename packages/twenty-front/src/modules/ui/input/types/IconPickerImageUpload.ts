export type IconPickerImageUpload = {
  imageUrl?: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
};
