import { EllipsisDisplayV2 } from '@/ui/field/display/components/EllipsisDisplayV2';

type NumberDisplayV2Props = {
  value: number | null;
};

export const NumberDisplayV2 = ({ value }: NumberDisplayV2Props) => (
  <EllipsisDisplayV2>{value?.toLocaleString('en-US')}</EllipsisDisplayV2>
);
