import { Controller, useFormContext } from 'react-hook-form';

type FileInputProps = {
  name: string;
  label: string;
  disabled?: boolean;
  accept?: string;
};

export const FileInput = ({
  name,
  label,
  disabled,
  accept,
}: FileInputProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange } }) => (
        <div>
          <label
            style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
          >
            {label}
          </label>
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0])}
            disabled={disabled}
            accept={accept}
            style={{ width: '100%' }}
          />
        </div>
      )}
    />
  );
};
