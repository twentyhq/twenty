import { useRatingFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRatingFieldDisplay';
import { RatingDisplay } from '@/ui/field/display/components/RatingDisplay';

export const RatingFieldStaticDisplay = () => {
  const { rating } = useRatingFieldDisplay();

  return <RatingDisplay value={rating} />;
};
