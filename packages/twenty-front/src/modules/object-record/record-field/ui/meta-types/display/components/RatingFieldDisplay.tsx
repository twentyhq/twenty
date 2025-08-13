import { useRatingFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRatingFieldDisplay';
import { RatingInput } from '@/ui/field/input/components/RatingInput';

export const RatingFieldDisplay = ({ readonly }: { readonly?: boolean }) => {
  const { rating } = useRatingFieldDisplay();

  return <RatingInput value={rating} readonly={readonly} />;
};
