import { type RATING_VALUES } from '@/object-record/record-field/ui/constants/RatingValues';

export type FieldRatingValue = (typeof RATING_VALUES)[number] | null;
