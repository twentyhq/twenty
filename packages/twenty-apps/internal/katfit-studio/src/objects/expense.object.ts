import { defineObject, FieldType } from 'twenty-sdk/define';
import { RUSSIAN_RUBLE_DEFAULT_VALUE } from 'src/constants/currency';

export const EXPENSE_OBJECT_UNIVERSAL_IDENTIFIER =
  '1ff4d074-8ce2-4b60-b79a-571a6e571e61';
export const EXPENSE_FIELDS = {
  name: 'ea3c22e1-c339-4b8a-8bfa-f380216d3802',
  amount: 'e570fb61-2dee-4850-9a0f-9f0097a9a9dd',
  category: '6467f392-59ae-462b-bca7-9e138830a87e',
  description: 'a432b50a-56fc-47bc-aa76-e0e375241634',
  paidOn: '5ca05589-18ab-4c11-b105-0554370d5c93',
  accruedOn: '4d4afe17-4220-4d86-9d17-aa53e3906d69',
  costType: '32088e14-c365-4ffa-9b0e-d15ad8bc8155',
} as const;

export default defineObject({
  universalIdentifier: EXPENSE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'studioExpense',
  namePlural: 'studioExpenses',
  labelSingular: 'Расход',
  labelPlural: 'Расходы',
  icon: 'IconReceipt',
  isUICreatable: false,
  isUIEditable: false,
  labelIdentifierFieldMetadataUniversalIdentifier: EXPENSE_FIELDS.name,
  fields: [
    {
      universalIdentifier: EXPENSE_FIELDS.name,
      name: 'name',
      type: FieldType.TEXT,
      label: 'Название',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: EXPENSE_FIELDS.amount,
      name: 'amount',
      type: FieldType.CURRENCY,
      label: 'Сумма',
      icon: 'IconCurrencyRubel',
      defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE,
      universalSettings: { format: 'full', decimals: 2 },
    },
    {
      universalIdentifier: EXPENSE_FIELDS.category,
      name: 'category',
      type: FieldType.SELECT,
      label: 'Категория',
      icon: 'IconCategory',
      options: [
        {
          id: 'ec85c63d-1b37-4c8a-a9b1-0bb8fa175922',
          value: 'RENT',
          label: 'Аренда',
          position: 0,
          color: 'gray',
        },
        {
          id: 'd5730afb-3baf-471e-9766-703af1d88587',
          value: 'TRAINERS',
          label: 'Выплаты тренерам',
          position: 1,
          color: 'gray',
        },
        {
          id: '5b4ff33f-f8f8-4886-8e4a-4cc53b12b787',
          value: 'MARKETING',
          label: 'Реклама',
          position: 2,
          color: 'gray',
        },
        {
          id: 'aeaf5347-126e-41ea-b7a2-52533150eb90',
          value: 'FEES',
          label: 'Комиссии',
          position: 3,
          color: 'gray',
        },
        {
          id: '0aba6353-f3a5-4449-84c8-0e3d86fd551f',
          value: 'SUPPLIES',
          label: 'Хозяйственные расходы',
          position: 4,
          color: 'gray',
        },
        {
          id: '8e41a961-72ee-4444-b810-d0ea57f8aa51',
          value: 'TAXES',
          label: 'Налоги',
          position: 5,
          color: 'gray',
        },
        {
          id: '934d9ac8-8850-40cb-98f5-c0c365d05d4f',
          value: 'OTHER',
          label: 'Прочее',
          position: 6,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: EXPENSE_FIELDS.description,
      name: 'description',
      type: FieldType.TEXT,
      label: 'Описание',
      icon: 'IconNotes',
      isNullable: true,
    },
    {
      universalIdentifier: EXPENSE_FIELDS.paidOn,
      name: 'paidOn',
      type: FieldType.DATE,
      label: 'Дата выплаты',
      icon: 'IconCalendarDollar',
      isNullable: true,
    },
    {
      universalIdentifier: EXPENSE_FIELDS.accruedOn,
      name: 'accruedOn',
      type: FieldType.DATE,
      label: 'Месяц начисления',
      description:
        'Месяц, к которому относится расход; хранится первым числом. Изменяйте через команду «Редактировать расход».',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: EXPENSE_FIELDS.costType,
      name: 'costType',
      type: FieldType.SELECT,
      label: 'Тип затрат',
      icon: 'IconAdjustments',
      options: [
        {
          id: 'be4d2bb2-2a9a-4903-a5cc-5cdb08110bec',
          value: 'FIXED',
          label: 'Постоянные',
          position: 0,
          color: 'gray',
        },
        {
          id: 'f4e602d6-9daa-4fd5-b6f9-05e865cc5c8b',
          value: 'VARIABLE',
          label: 'Переменные',
          position: 1,
          color: 'gray',
        },
      ],
    },
  ],
});
