import { defineObject, FieldType } from 'twenty-sdk/define';

enum PropertyStatus {
  COMING_SOON = 'COMING_SOON',
  ACTIVE = 'ACTIVE',
  UNDER_OFFER = 'UNDER_OFFER',
  SOLD = 'SOLD',
}

enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  CONDO = 'CONDO',
  LAND = 'LAND',
}

export const PROPERTY_UNIVERSAL_IDENTIFIER =
  'f1d4bc63-38e4-467f-ad87-ffc0feaf5f01';

export const PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '4bb99253-6ae2-4aa8-8f44-708ce3d29c31';
export const PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '97fb5f33-bdc3-4b04-9c32-86d5ff995b0e';
export const PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER =
  '0fc19f9c-4bc5-41e6-8295-628e0258ba15';

export default defineObject({
  universalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
  nameSingular: 'property',
  namePlural: 'properties',
  labelSingular: 'Property',
  labelPlural: 'Properties',
  description: 'A property listing',
  icon: 'IconHome',
  labelIdentifierFieldMetadataUniversalIdentifier:
    PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Listing name, e.g. the street address',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: 'b254a4f5-669f-429c-af92-f4df283b132a',
      type: FieldType.ADDRESS,
      name: 'propertyAddress',
      label: 'Address',
      icon: 'IconMapPin',
    },
    {
      universalIdentifier: PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'price',
      label: 'Price',
      icon: 'IconCurrencyEuro',
      isNullable: true,
    },
    {
      universalIdentifier: PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${PropertyStatus.ACTIVE}'`,
      options: [
        {
          id: '075cab08-9a87-401a-b3b2-47f8e0504112',
          value: PropertyStatus.COMING_SOON,
          label: 'Coming soon',
          position: 0,
          color: 'gray',
        },
        {
          id: 'd637ac19-fcf4-4a92-921c-72fe505f2123',
          value: PropertyStatus.ACTIVE,
          label: 'Active',
          position: 1,
          color: 'green',
        },
        {
          id: 'f0ab44f3-7939-4e00-92ba-9c29010e6d52',
          value: PropertyStatus.UNDER_OFFER,
          label: 'Under offer',
          position: 2,
          color: 'orange',
        },
        {
          id: '67d245aa-6ec9-42c0-a657-83dd842e4107',
          value: PropertyStatus.SOLD,
          label: 'Sold',
          position: 3,
          color: 'blue',
        },
      ],
    },
    {
      universalIdentifier: 'f6bf3f42-6c4f-4dba-af51-7db74979c888',
      type: FieldType.SELECT,
      name: 'propertyType',
      label: 'Property type',
      icon: 'IconBuildingCommunity',
      isNullable: true,
      options: [
        {
          id: '7efcd575-d7d0-46d9-bf26-54a3c1d5ba1e',
          value: PropertyType.APARTMENT,
          label: 'Apartment',
          position: 0,
          color: 'blue',
        },
        {
          id: 'b6f3ec35-3cac-4ad3-8f4a-7144edda75e9',
          value: PropertyType.HOUSE,
          label: 'House',
          position: 1,
          color: 'green',
        },
        {
          id: '486a439d-af96-4884-8125-5f5ca01999fe',
          value: PropertyType.CONDO,
          label: 'Condo',
          position: 2,
          color: 'purple',
        },
        {
          id: '53db1ebd-c816-40c4-85d5-3c17a39669cd',
          value: PropertyType.LAND,
          label: 'Land',
          position: 3,
          color: 'brown',
        },
      ],
    },
    {
      universalIdentifier: 'f3254ad1-ac74-459b-bfdc-b443dad61001',
      type: FieldType.NUMBER,
      name: 'bedrooms',
      label: 'Bedrooms',
      icon: 'IconBed',
      isNullable: true,
    },
    {
      universalIdentifier: 'f1289297-f0d3-4001-bb45-100135d71e88',
      type: FieldType.NUMBER,
      name: 'bathrooms',
      label: 'Bathrooms',
      icon: 'IconBath',
      isNullable: true,
    },
    {
      universalIdentifier: '6de9a40e-6260-4dbf-8096-7296bc87911e',
      type: FieldType.NUMBER,
      name: 'surfaceSqm',
      label: 'Surface (sqm)',
      icon: 'IconRuler2',
      isNullable: true,
    },
    {
      universalIdentifier: 'eb610e48-e621-43c8-8f1b-934b1af42a03',
      type: FieldType.FILES,
      name: 'photos',
      label: 'Photos',
      icon: 'IconPhoto',
      isNullable: true,
      universalSettings: { maxNumberOfValues: 10 },
    },
  ],
});
