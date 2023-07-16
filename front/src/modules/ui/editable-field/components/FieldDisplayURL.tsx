import { RawLink } from '@/ui/link/components/RawLink';

export function FieldDisplayURL({ URL }: { URL: string | undefined }) {
  return <RawLink href={URL ? 'https://' + URL : ''}>{URL}</RawLink>;
}
