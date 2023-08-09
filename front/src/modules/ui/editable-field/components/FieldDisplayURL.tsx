import { RoundedLink } from '@/ui/link/components/RoundedLink';

export function FieldDisplayURL({ URL }: { URL: string | undefined }) {
  return <RoundedLink href={URL ? 'https://' + URL : ''}>{URL}</RoundedLink>;
}
