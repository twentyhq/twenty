import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import {
  IconCalendarEvent,
  IconCheck,
  IconCoins,
  IconKey,
  IconLink,
  IconMail,
  IconNumbers,
  IconPhone,
  IconRelationManyToMany,
  IconTag,
  IconTextSize,
  IconUser,
} from '@/ui/display/icon';
import { IconTwentyStar } from '@/ui/display/icon/components/IconTwentyStar';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const defaultDateValue = new Date();
defaultDateValue.setFullYear(defaultDateValue.getFullYear() + 2);

export const settingsFieldMetadataTypes: Partial<
  Record<
    FieldMetadataType,
    { label: string; Icon: IconComponent; defaultValue?: unknown }
  >
> = {
  [FieldMetadataType.Uuid]: {
    label: 'Unique ID',
    Icon: IconKey,
    defaultValue: '00000000-0000-0000-0000-000000000000',
  },
  [FieldMetadataType.Text]: {
    label: 'Text',
    Icon: IconTextSize,
    defaultValue:
      'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد.',
  },
  [FieldMetadataType.Numeric]: {
    label: 'Numeric',
    Icon: IconNumbers,
    defaultValue: 2000,
  },
  [FieldMetadataType.Number]: {
    label: 'Number',
    Icon: IconNumbers,
    defaultValue: 2000,
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IconLink,
    defaultValue: { url: 'www.tabatelecom.ir/', label: '' },
  },
  [FieldMetadataType.Boolean]: {
    label: 'True/False',
    Icon: IconCheck,
    defaultValue: true,
  },
  [FieldMetadataType.DateTime]: {
    label: 'Date & Time',
    Icon: IconCalendarEvent,
    defaultValue: defaultDateValue.toISOString(),
  },
  [FieldMetadataType.Select]: {
    label: 'Select',
    Icon: IconTag,
  },
  [FieldMetadataType.MultiSelect]: {
    label: 'MultiSelect',
    Icon: IconTag,
  },
  [FieldMetadataType.Currency]: {
    label: 'Currency',
    Icon: IconCoins,
    defaultValue: { amountMicros: 2000000000, currencyCode: CurrencyCode.USD },
  },
  [FieldMetadataType.Relation]: {
    label: 'Relation',
    Icon: IconRelationManyToMany,
  },
  [FieldMetadataType.Email]: { label: 'Email', Icon: IconMail },
  [FieldMetadataType.Phone]: { label: 'Phone', Icon: IconPhone },
  [FieldMetadataType.Probability]: {
    label: 'Rating',
    Icon: IconTwentyStar,
    defaultValue: '3',
  },
  [FieldMetadataType.Rating]: {
    label: 'Rating',
    Icon: IconTwentyStar,
    defaultValue: '3',
  },
  [FieldMetadataType.FullName]: { label: 'Full Name', Icon: IconUser },
};
