import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlLocationCountry,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlLocationCountry',
  label: 'Country',
  description: 'People Data Labs canonical country.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .afghanistan,
      value: 'AFGHANISTAN',
      label: 'Afghanistan',
      color: 'green',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.albania,
      value: 'ALBANIA',
      label: 'Albania',
      color: 'turquoise',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.algeria,
      value: 'ALGERIA',
      label: 'Algeria',
      color: 'sky',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .americanSamoa,
      value: 'AMERICAN_SAMOA',
      label: 'American Samoa',
      color: 'blue',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.andorra,
      value: 'ANDORRA',
      label: 'Andorra',
      color: 'purple',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.angola,
      value: 'ANGOLA',
      label: 'Angola',
      color: 'pink',
      position: 5,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .anguilla,
      value: 'ANGUILLA',
      label: 'Anguilla',
      color: 'red',
      position: 6,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .antiguaAndBarbuda,
      value: 'ANTIGUA_AND_BARBUDA',
      label: 'Antigua And Barbuda',
      color: 'orange',
      position: 7,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .argentina,
      value: 'ARGENTINA',
      label: 'Argentina',
      color: 'yellow',
      position: 8,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.armenia,
      value: 'ARMENIA',
      label: 'Armenia',
      color: 'gray',
      position: 9,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.aruba,
      value: 'ARUBA',
      label: 'Aruba',
      color: 'green',
      position: 10,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .australia,
      value: 'AUSTRALIA',
      label: 'Australia',
      color: 'turquoise',
      position: 11,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.austria,
      value: 'AUSTRIA',
      label: 'Austria',
      color: 'sky',
      position: 12,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .azerbaijan,
      value: 'AZERBAIJAN',
      label: 'Azerbaijan',
      color: 'blue',
      position: 13,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.bahamas,
      value: 'BAHAMAS',
      label: 'Bahamas',
      color: 'purple',
      position: 14,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.bahrain,
      value: 'BAHRAIN',
      label: 'Bahrain',
      color: 'pink',
      position: 15,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .bangladesh,
      value: 'BANGLADESH',
      label: 'Bangladesh',
      color: 'red',
      position: 16,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .barbados,
      value: 'BARBADOS',
      label: 'Barbados',
      color: 'orange',
      position: 17,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.belarus,
      value: 'BELARUS',
      label: 'Belarus',
      color: 'yellow',
      position: 18,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.belgium,
      value: 'BELGIUM',
      label: 'Belgium',
      color: 'gray',
      position: 19,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.belize,
      value: 'BELIZE',
      label: 'Belize',
      color: 'green',
      position: 20,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.benin,
      value: 'BENIN',
      label: 'Benin',
      color: 'turquoise',
      position: 21,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.bermuda,
      value: 'BERMUDA',
      label: 'Bermuda',
      color: 'sky',
      position: 22,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.bhutan,
      value: 'BHUTAN',
      label: 'Bhutan',
      color: 'blue',
      position: 23,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.bolivia,
      value: 'BOLIVIA',
      label: 'Bolivia',
      color: 'purple',
      position: 24,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .bosniaAndHerzegovina,
      value: 'BOSNIA_AND_HERZEGOVINA',
      label: 'Bosnia And Herzegovina',
      color: 'pink',
      position: 25,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .botswana,
      value: 'BOTSWANA',
      label: 'Botswana',
      color: 'red',
      position: 26,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .bouvetIsland,
      value: 'BOUVET_ISLAND',
      label: 'Bouvet Island',
      color: 'orange',
      position: 27,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.brazil,
      value: 'BRAZIL',
      label: 'Brazil',
      color: 'yellow',
      position: 28,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .britishIndianOceanTerritory,
      value: 'BRITISH_INDIAN_OCEAN_TERRITORY',
      label: 'British Indian Ocean Territory',
      color: 'gray',
      position: 29,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .britishVirginIslands,
      value: 'BRITISH_VIRGIN_ISLANDS',
      label: 'British Virgin Islands',
      color: 'green',
      position: 30,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.brunei,
      value: 'BRUNEI',
      label: 'Brunei',
      color: 'turquoise',
      position: 31,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .bulgaria,
      value: 'BULGARIA',
      label: 'Bulgaria',
      color: 'sky',
      position: 32,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .burkinaFaso,
      value: 'BURKINA_FASO',
      label: 'Burkina Faso',
      color: 'blue',
      position: 33,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.burundi,
      value: 'BURUNDI',
      label: 'Burundi',
      color: 'purple',
      position: 34,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .cambodia,
      value: 'CAMBODIA',
      label: 'Cambodia',
      color: 'pink',
      position: 35,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .cameroon,
      value: 'CAMEROON',
      label: 'Cameroon',
      color: 'red',
      position: 36,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.canada,
      value: 'CANADA',
      label: 'Canada',
      color: 'orange',
      position: 37,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .capeVerde,
      value: 'CAPE_VERDE',
      label: 'Cape Verde',
      color: 'yellow',
      position: 38,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .caribbeanNetherlands,
      value: 'CARIBBEAN_NETHERLANDS',
      label: 'Caribbean Netherlands',
      color: 'gray',
      position: 39,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .caymanIslands,
      value: 'CAYMAN_ISLANDS',
      label: 'Cayman Islands',
      color: 'green',
      position: 40,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .centralAfricanRepublic,
      value: 'CENTRAL_AFRICAN_REPUBLIC',
      label: 'Central African Republic',
      color: 'turquoise',
      position: 41,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.chad,
      value: 'CHAD',
      label: 'Chad',
      color: 'sky',
      position: 42,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.chile,
      value: 'CHILE',
      label: 'Chile',
      color: 'blue',
      position: 43,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.china,
      value: 'CHINA',
      label: 'China',
      color: 'purple',
      position: 44,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .christmasIsland,
      value: 'CHRISTMAS_ISLAND',
      label: 'Christmas Island',
      color: 'pink',
      position: 45,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .cocosKeelingIslands,
      value: 'COCOS_KEELING_ISLANDS',
      label: 'Cocos (keeling) Islands',
      color: 'red',
      position: 46,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .colombia,
      value: 'COLOMBIA',
      label: 'Colombia',
      color: 'orange',
      position: 47,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.comoros,
      value: 'COMOROS',
      label: 'Comoros',
      color: 'yellow',
      position: 48,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .cookIslands,
      value: 'COOK_ISLANDS',
      label: 'Cook Islands',
      color: 'gray',
      position: 49,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .costaRica,
      value: 'COSTA_RICA',
      label: 'Costa Rica',
      color: 'green',
      position: 50,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.croatia,
      value: 'CROATIA',
      label: 'Croatia',
      color: 'turquoise',
      position: 51,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.cuba,
      value: 'CUBA',
      label: 'Cuba',
      color: 'sky',
      position: 52,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.curacao,
      value: 'CURACAO',
      label: 'Curaçao',
      color: 'blue',
      position: 53,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.cyprus,
      value: 'CYPRUS',
      label: 'Cyprus',
      color: 'purple',
      position: 54,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.czechia,
      value: 'CZECHIA',
      label: 'Czechia',
      color: 'pink',
      position: 55,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .coteDIvoire,
      value: 'COTE_D_IVOIRE',
      label: "Côte D'ivoire",
      color: 'red',
      position: 56,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .democraticRepublicOfTheCongo,
      value: 'DEMOCRATIC_REPUBLIC_OF_THE_CONGO',
      label: 'Democratic Republic Of The Congo',
      color: 'orange',
      position: 57,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.denmark,
      value: 'DENMARK',
      label: 'Denmark',
      color: 'yellow',
      position: 58,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .djibouti,
      value: 'DJIBOUTI',
      label: 'Djibouti',
      color: 'gray',
      position: 59,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .dominica,
      value: 'DOMINICA',
      label: 'Dominica',
      color: 'green',
      position: 60,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .dominicanRepublic,
      value: 'DOMINICAN_REPUBLIC',
      label: 'Dominican Republic',
      color: 'turquoise',
      position: 61,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.ecuador,
      value: 'ECUADOR',
      label: 'Ecuador',
      color: 'sky',
      position: 62,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.egypt,
      value: 'EGYPT',
      label: 'Egypt',
      color: 'blue',
      position: 63,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .elSalvador,
      value: 'EL_SALVADOR',
      label: 'El Salvador',
      color: 'purple',
      position: 64,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .equatorialGuinea,
      value: 'EQUATORIAL_GUINEA',
      label: 'Equatorial Guinea',
      color: 'pink',
      position: 65,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.eritrea,
      value: 'ERITREA',
      label: 'Eritrea',
      color: 'red',
      position: 66,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.estonia,
      value: 'ESTONIA',
      label: 'Estonia',
      color: 'orange',
      position: 67,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .eswatini,
      value: 'ESWATINI',
      label: 'Eswatini',
      color: 'yellow',
      position: 68,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .ethiopia,
      value: 'ETHIOPIA',
      label: 'Ethiopia',
      color: 'gray',
      position: 69,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .falklandIslands,
      value: 'FALKLAND_ISLANDS',
      label: 'Falkland Islands',
      color: 'green',
      position: 70,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .faroeIslands,
      value: 'FAROE_ISLANDS',
      label: 'Faroe Islands',
      color: 'turquoise',
      position: 71,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.fiji,
      value: 'FIJI',
      label: 'Fiji',
      color: 'sky',
      position: 72,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.finland,
      value: 'FINLAND',
      label: 'Finland',
      color: 'blue',
      position: 73,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.france,
      value: 'FRANCE',
      label: 'France',
      color: 'purple',
      position: 74,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .frenchGuiana,
      value: 'FRENCH_GUIANA',
      label: 'French Guiana',
      color: 'pink',
      position: 75,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .frenchPolynesia,
      value: 'FRENCH_POLYNESIA',
      label: 'French Polynesia',
      color: 'red',
      position: 76,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .frenchSouthernTerritories,
      value: 'FRENCH_SOUTHERN_TERRITORIES',
      label: 'French Southern Territories',
      color: 'orange',
      position: 77,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.gabon,
      value: 'GABON',
      label: 'Gabon',
      color: 'yellow',
      position: 78,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.georgia,
      value: 'GEORGIA',
      label: 'Georgia',
      color: 'gray',
      position: 79,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.germany,
      value: 'GERMANY',
      label: 'Germany',
      color: 'green',
      position: 80,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.ghana,
      value: 'GHANA',
      label: 'Ghana',
      color: 'turquoise',
      position: 81,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .gibraltar,
      value: 'GIBRALTAR',
      label: 'Gibraltar',
      color: 'sky',
      position: 82,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.greece,
      value: 'GREECE',
      label: 'Greece',
      color: 'blue',
      position: 83,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .greenland,
      value: 'GREENLAND',
      label: 'Greenland',
      color: 'purple',
      position: 84,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.grenada,
      value: 'GRENADA',
      label: 'Grenada',
      color: 'pink',
      position: 85,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .guadeloupe,
      value: 'GUADELOUPE',
      label: 'Guadeloupe',
      color: 'red',
      position: 86,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.guam,
      value: 'GUAM',
      label: 'Guam',
      color: 'orange',
      position: 87,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .guatemala,
      value: 'GUATEMALA',
      label: 'Guatemala',
      color: 'yellow',
      position: 88,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .guernsey,
      value: 'GUERNSEY',
      label: 'Guernsey',
      color: 'gray',
      position: 89,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.guinea,
      value: 'GUINEA',
      label: 'Guinea',
      color: 'green',
      position: 90,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .guineaBissau,
      value: 'GUINEA_BISSAU',
      label: 'Guinea-bissau',
      color: 'turquoise',
      position: 91,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.guyana,
      value: 'GUYANA',
      label: 'Guyana',
      color: 'sky',
      position: 92,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.haiti,
      value: 'HAITI',
      label: 'Haiti',
      color: 'blue',
      position: 93,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .heardIslandAndMcdonaldIslands,
      value: 'HEARD_ISLAND_AND_MCDONALD_ISLANDS',
      label: 'Heard Island And Mcdonald Islands',
      color: 'purple',
      position: 94,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .honduras,
      value: 'HONDURAS',
      label: 'Honduras',
      color: 'pink',
      position: 95,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .hongKong,
      value: 'HONG_KONG',
      label: 'Hong Kong',
      color: 'red',
      position: 96,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.hungary,
      value: 'HUNGARY',
      label: 'Hungary',
      color: 'orange',
      position: 97,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.iceland,
      value: 'ICELAND',
      label: 'Iceland',
      color: 'yellow',
      position: 98,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.india,
      value: 'INDIA',
      label: 'India',
      color: 'gray',
      position: 99,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .indonesia,
      value: 'INDONESIA',
      label: 'Indonesia',
      color: 'green',
      position: 100,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.iran,
      value: 'IRAN',
      label: 'Iran',
      color: 'turquoise',
      position: 101,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.iraq,
      value: 'IRAQ',
      label: 'Iraq',
      color: 'sky',
      position: 102,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.ireland,
      value: 'IRELAND',
      label: 'Ireland',
      color: 'blue',
      position: 103,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .isleOfMan,
      value: 'ISLE_OF_MAN',
      label: 'Isle Of Man',
      color: 'purple',
      position: 104,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.israel,
      value: 'ISRAEL',
      label: 'Israel',
      color: 'pink',
      position: 105,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.italy,
      value: 'ITALY',
      label: 'Italy',
      color: 'red',
      position: 106,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.jamaica,
      value: 'JAMAICA',
      label: 'Jamaica',
      color: 'orange',
      position: 107,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.japan,
      value: 'JAPAN',
      label: 'Japan',
      color: 'yellow',
      position: 108,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.jersey,
      value: 'JERSEY',
      label: 'Jersey',
      color: 'gray',
      position: 109,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.jordan,
      value: 'JORDAN',
      label: 'Jordan',
      color: 'green',
      position: 110,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .kazakhstan,
      value: 'KAZAKHSTAN',
      label: 'Kazakhstan',
      color: 'turquoise',
      position: 111,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.kenya,
      value: 'KENYA',
      label: 'Kenya',
      color: 'sky',
      position: 112,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .kiribati,
      value: 'KIRIBATI',
      label: 'Kiribati',
      color: 'blue',
      position: 113,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.kosovo,
      value: 'KOSOVO',
      label: 'Kosovo',
      color: 'purple',
      position: 114,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.kuwait,
      value: 'KUWAIT',
      label: 'Kuwait',
      color: 'pink',
      position: 115,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .kyrgyzstan,
      value: 'KYRGYZSTAN',
      label: 'Kyrgyzstan',
      color: 'red',
      position: 116,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.laos,
      value: 'LAOS',
      label: 'Laos',
      color: 'orange',
      position: 117,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.latvia,
      value: 'LATVIA',
      label: 'Latvia',
      color: 'yellow',
      position: 118,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.lebanon,
      value: 'LEBANON',
      label: 'Lebanon',
      color: 'gray',
      position: 119,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.lesotho,
      value: 'LESOTHO',
      label: 'Lesotho',
      color: 'green',
      position: 120,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.liberia,
      value: 'LIBERIA',
      label: 'Liberia',
      color: 'turquoise',
      position: 121,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.libya,
      value: 'LIBYA',
      label: 'Libya',
      color: 'sky',
      position: 122,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .liechtenstein,
      value: 'LIECHTENSTEIN',
      label: 'Liechtenstein',
      color: 'blue',
      position: 123,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .lithuania,
      value: 'LITHUANIA',
      label: 'Lithuania',
      color: 'purple',
      position: 124,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .luxembourg,
      value: 'LUXEMBOURG',
      label: 'Luxembourg',
      color: 'pink',
      position: 125,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.macau,
      value: 'MACAU',
      label: 'Macau',
      color: 'red',
      position: 126,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .madagascar,
      value: 'MADAGASCAR',
      label: 'Madagascar',
      color: 'orange',
      position: 127,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.malawi,
      value: 'MALAWI',
      label: 'Malawi',
      color: 'yellow',
      position: 128,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .malaysia,
      value: 'MALAYSIA',
      label: 'Malaysia',
      color: 'gray',
      position: 129,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .maldives,
      value: 'MALDIVES',
      label: 'Maldives',
      color: 'green',
      position: 130,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.mali,
      value: 'MALI',
      label: 'Mali',
      color: 'turquoise',
      position: 131,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.malta,
      value: 'MALTA',
      label: 'Malta',
      color: 'sky',
      position: 132,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .marshallIslands,
      value: 'MARSHALL_ISLANDS',
      label: 'Marshall Islands',
      color: 'blue',
      position: 133,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .martinique,
      value: 'MARTINIQUE',
      label: 'Martinique',
      color: 'purple',
      position: 134,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .mauritania,
      value: 'MAURITANIA',
      label: 'Mauritania',
      color: 'pink',
      position: 135,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .mauritius,
      value: 'MAURITIUS',
      label: 'Mauritius',
      color: 'red',
      position: 136,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.mayotte,
      value: 'MAYOTTE',
      label: 'Mayotte',
      color: 'orange',
      position: 137,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.mexico,
      value: 'MEXICO',
      label: 'Mexico',
      color: 'yellow',
      position: 138,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .micronesia,
      value: 'MICRONESIA',
      label: 'Micronesia',
      color: 'gray',
      position: 139,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.moldova,
      value: 'MOLDOVA',
      label: 'Moldova',
      color: 'green',
      position: 140,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.monaco,
      value: 'MONACO',
      label: 'Monaco',
      color: 'turquoise',
      position: 141,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .mongolia,
      value: 'MONGOLIA',
      label: 'Mongolia',
      color: 'sky',
      position: 142,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .montenegro,
      value: 'MONTENEGRO',
      label: 'Montenegro',
      color: 'blue',
      position: 143,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .montserrat,
      value: 'MONTSERRAT',
      label: 'Montserrat',
      color: 'purple',
      position: 144,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.morocco,
      value: 'MOROCCO',
      label: 'Morocco',
      color: 'pink',
      position: 145,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .mozambique,
      value: 'MOZAMBIQUE',
      label: 'Mozambique',
      color: 'red',
      position: 146,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.myanmar,
      value: 'MYANMAR',
      label: 'Myanmar',
      color: 'orange',
      position: 147,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.namibia,
      value: 'NAMIBIA',
      label: 'Namibia',
      color: 'yellow',
      position: 148,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.nauru,
      value: 'NAURU',
      label: 'Nauru',
      color: 'gray',
      position: 149,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.nepal,
      value: 'NEPAL',
      label: 'Nepal',
      color: 'green',
      position: 150,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .netherlands,
      value: 'NETHERLANDS',
      label: 'Netherlands',
      color: 'turquoise',
      position: 151,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .newCaledonia,
      value: 'NEW_CALEDONIA',
      label: 'New Caledonia',
      color: 'sky',
      position: 152,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .newZealand,
      value: 'NEW_ZEALAND',
      label: 'New Zealand',
      color: 'blue',
      position: 153,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .nicaragua,
      value: 'NICARAGUA',
      label: 'Nicaragua',
      color: 'purple',
      position: 154,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.niger,
      value: 'NIGER',
      label: 'Niger',
      color: 'pink',
      position: 155,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.nigeria,
      value: 'NIGERIA',
      label: 'Nigeria',
      color: 'red',
      position: 156,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.niue,
      value: 'NIUE',
      label: 'Niue',
      color: 'orange',
      position: 157,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .norfolkIsland,
      value: 'NORFOLK_ISLAND',
      label: 'Norfolk Island',
      color: 'yellow',
      position: 158,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .northKorea,
      value: 'NORTH_KOREA',
      label: 'North Korea',
      color: 'gray',
      position: 159,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .northMacedonia,
      value: 'NORTH_MACEDONIA',
      label: 'North Macedonia',
      color: 'green',
      position: 160,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .northernMarianaIslands,
      value: 'NORTHERN_MARIANA_ISLANDS',
      label: 'Northern Mariana Islands',
      color: 'turquoise',
      position: 161,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.norway,
      value: 'NORWAY',
      label: 'Norway',
      color: 'sky',
      position: 162,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.oman,
      value: 'OMAN',
      label: 'Oman',
      color: 'blue',
      position: 163,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .pakistan,
      value: 'PAKISTAN',
      label: 'Pakistan',
      color: 'purple',
      position: 164,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.palau,
      value: 'PALAU',
      label: 'Palau',
      color: 'pink',
      position: 165,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .palestine,
      value: 'PALESTINE',
      label: 'Palestine',
      color: 'red',
      position: 166,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.panama,
      value: 'PANAMA',
      label: 'Panama',
      color: 'orange',
      position: 167,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .papuaNewGuinea,
      value: 'PAPUA_NEW_GUINEA',
      label: 'Papua New Guinea',
      color: 'yellow',
      position: 168,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .paraguay,
      value: 'PARAGUAY',
      label: 'Paraguay',
      color: 'gray',
      position: 169,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.peru,
      value: 'PERU',
      label: 'Peru',
      color: 'green',
      position: 170,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .philippines,
      value: 'PHILIPPINES',
      label: 'Philippines',
      color: 'turquoise',
      position: 171,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .pitcairnIslands,
      value: 'PITCAIRN_ISLANDS',
      label: 'Pitcairn Islands',
      color: 'sky',
      position: 172,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.poland,
      value: 'POLAND',
      label: 'Poland',
      color: 'blue',
      position: 173,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .portugal,
      value: 'PORTUGAL',
      label: 'Portugal',
      color: 'purple',
      position: 174,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .puertoRico,
      value: 'PUERTO_RICO',
      label: 'Puerto Rico',
      color: 'pink',
      position: 175,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.qatar,
      value: 'QATAR',
      label: 'Qatar',
      color: 'red',
      position: 176,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .republicOfTheCongo,
      value: 'REPUBLIC_OF_THE_CONGO',
      label: 'Republic Of The Congo',
      color: 'orange',
      position: 177,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.romania,
      value: 'ROMANIA',
      label: 'Romania',
      color: 'yellow',
      position: 178,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.russia,
      value: 'RUSSIA',
      label: 'Russia',
      color: 'gray',
      position: 179,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.rwanda,
      value: 'RWANDA',
      label: 'Rwanda',
      color: 'green',
      position: 180,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.reunion,
      value: 'REUNION',
      label: 'Réunion',
      color: 'turquoise',
      position: 181,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saintBarthelemy,
      value: 'SAINT_BARTHELEMY',
      label: 'Saint Barthélemy',
      color: 'sky',
      position: 182,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saintHelena,
      value: 'SAINT_HELENA',
      label: 'Saint Helena',
      color: 'blue',
      position: 183,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saintKittsAndNevis,
      value: 'SAINT_KITTS_AND_NEVIS',
      label: 'Saint Kitts And Nevis',
      color: 'purple',
      position: 184,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saintLucia,
      value: 'SAINT_LUCIA',
      label: 'Saint Lucia',
      color: 'pink',
      position: 185,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saintMartin,
      value: 'SAINT_MARTIN',
      label: 'Saint Martin',
      color: 'red',
      position: 186,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saintPierreAndMiquelon,
      value: 'SAINT_PIERRE_AND_MIQUELON',
      label: 'Saint Pierre And Miquelon',
      color: 'orange',
      position: 187,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saintVincentAndTheGrenadines,
      value: 'SAINT_VINCENT_AND_THE_GRENADINES',
      label: 'Saint Vincent And The Grenadines',
      color: 'yellow',
      position: 188,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.samoa,
      value: 'SAMOA',
      label: 'Samoa',
      color: 'gray',
      position: 189,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .sanMarino,
      value: 'SAN_MARINO',
      label: 'San Marino',
      color: 'green',
      position: 190,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saudiArabia,
      value: 'SAUDI_ARABIA',
      label: 'Saudi Arabia',
      color: 'turquoise',
      position: 191,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.senegal,
      value: 'SENEGAL',
      label: 'Senegal',
      color: 'sky',
      position: 192,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.serbia,
      value: 'SERBIA',
      label: 'Serbia',
      color: 'blue',
      position: 193,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .seychelles,
      value: 'SEYCHELLES',
      label: 'Seychelles',
      color: 'purple',
      position: 194,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .sierraLeone,
      value: 'SIERRA_LEONE',
      label: 'Sierra Leone',
      color: 'pink',
      position: 195,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .singapore,
      value: 'SINGAPORE',
      label: 'Singapore',
      color: 'red',
      position: 196,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .sintMaarten,
      value: 'SINT_MAARTEN',
      label: 'Sint Maarten',
      color: 'orange',
      position: 197,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .slovakia,
      value: 'SLOVAKIA',
      label: 'Slovakia',
      color: 'yellow',
      position: 198,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .slovenia,
      value: 'SLOVENIA',
      label: 'Slovenia',
      color: 'gray',
      position: 199,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .solomonIslands,
      value: 'SOLOMON_ISLANDS',
      label: 'Solomon Islands',
      color: 'green',
      position: 200,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.somalia,
      value: 'SOMALIA',
      label: 'Somalia',
      color: 'turquoise',
      position: 201,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .southAfrica,
      value: 'SOUTH_AFRICA',
      label: 'South Africa',
      color: 'sky',
      position: 202,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .southGeorgiaAndTheSouthSandwichIslands,
      value: 'SOUTH_GEORGIA_AND_THE_SOUTH_SANDWICH_ISLANDS',
      label: 'South Georgia And The South Sandwich Islands',
      color: 'blue',
      position: 203,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .southKorea,
      value: 'SOUTH_KOREA',
      label: 'South Korea',
      color: 'purple',
      position: 204,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .southSudan,
      value: 'SOUTH_SUDAN',
      label: 'South Sudan',
      color: 'pink',
      position: 205,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.spain,
      value: 'SPAIN',
      label: 'Spain',
      color: 'red',
      position: 206,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .sriLanka,
      value: 'SRI_LANKA',
      label: 'Sri Lanka',
      color: 'orange',
      position: 207,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.sudan,
      value: 'SUDAN',
      label: 'Sudan',
      color: 'yellow',
      position: 208,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .suriname,
      value: 'SURINAME',
      label: 'Suriname',
      color: 'gray',
      position: 209,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .svalbardAndJanMayen,
      value: 'SVALBARD_AND_JAN_MAYEN',
      label: 'Svalbard And Jan Mayen',
      color: 'green',
      position: 210,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.sweden,
      value: 'SWEDEN',
      label: 'Sweden',
      color: 'turquoise',
      position: 211,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .switzerland,
      value: 'SWITZERLAND',
      label: 'Switzerland',
      color: 'sky',
      position: 212,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.syria,
      value: 'SYRIA',
      label: 'Syria',
      color: 'blue',
      position: 213,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .saoTomeAndPrincipe,
      value: 'SAO_TOME_AND_PRINCIPE',
      label: 'São Tomé And Príncipe',
      color: 'purple',
      position: 214,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.taiwan,
      value: 'TAIWAN',
      label: 'Taiwan',
      color: 'pink',
      position: 215,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .tajikistan,
      value: 'TAJIKISTAN',
      label: 'Tajikistan',
      color: 'red',
      position: 216,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .tanzania,
      value: 'TANZANIA',
      label: 'Tanzania',
      color: 'orange',
      position: 217,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .thailand,
      value: 'THAILAND',
      label: 'Thailand',
      color: 'yellow',
      position: 218,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .theGambia,
      value: 'THE_GAMBIA',
      label: 'The Gambia',
      color: 'gray',
      position: 219,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .timorLeste,
      value: 'TIMOR_LESTE',
      label: 'Timor-leste',
      color: 'green',
      position: 220,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.togo,
      value: 'TOGO',
      label: 'Togo',
      color: 'turquoise',
      position: 221,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.tokelau,
      value: 'TOKELAU',
      label: 'Tokelau',
      color: 'sky',
      position: 222,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.tonga,
      value: 'TONGA',
      label: 'Tonga',
      color: 'blue',
      position: 223,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .trinidadAndTobago,
      value: 'TRINIDAD_AND_TOBAGO',
      label: 'Trinidad And Tobago',
      color: 'purple',
      position: 224,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.tunisia,
      value: 'TUNISIA',
      label: 'Tunisia',
      color: 'pink',
      position: 225,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.turkey,
      value: 'TURKEY',
      label: 'Turkey',
      color: 'red',
      position: 226,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .turkmenistan,
      value: 'TURKMENISTAN',
      label: 'Turkmenistan',
      color: 'orange',
      position: 227,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .turksAndCaicosIslands,
      value: 'TURKS_AND_CAICOS_ISLANDS',
      label: 'Turks And Caicos Islands',
      color: 'yellow',
      position: 228,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.tuvalu,
      value: 'TUVALU',
      label: 'Tuvalu',
      color: 'gray',
      position: 229,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .uSVirginIslands,
      value: 'U_S_VIRGIN_ISLANDS',
      label: 'U.s. Virgin Islands',
      color: 'green',
      position: 230,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.uganda,
      value: 'UGANDA',
      label: 'Uganda',
      color: 'turquoise',
      position: 231,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.ukraine,
      value: 'UKRAINE',
      label: 'Ukraine',
      color: 'sky',
      position: 232,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .unitedArabEmirates,
      value: 'UNITED_ARAB_EMIRATES',
      label: 'United Arab Emirates',
      color: 'blue',
      position: 233,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .unitedKingdom,
      value: 'UNITED_KINGDOM',
      label: 'United Kingdom',
      color: 'purple',
      position: 234,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .unitedStates,
      value: 'UNITED_STATES',
      label: 'United States',
      color: 'pink',
      position: 235,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .unitedStatesMinorOutlyingIslands,
      value: 'UNITED_STATES_MINOR_OUTLYING_ISLANDS',
      label: 'United States Minor Outlying Islands',
      color: 'red',
      position: 236,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.uruguay,
      value: 'URUGUAY',
      label: 'Uruguay',
      color: 'orange',
      position: 237,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .uzbekistan,
      value: 'UZBEKISTAN',
      label: 'Uzbekistan',
      color: 'yellow',
      position: 238,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.vanuatu,
      value: 'VANUATU',
      label: 'Vanuatu',
      color: 'gray',
      position: 239,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .vaticanCity,
      value: 'VATICAN_CITY',
      label: 'Vatican City',
      color: 'green',
      position: 240,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .venezuela,
      value: 'VENEZUELA',
      label: 'Venezuela',
      color: 'turquoise',
      position: 241,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.vietnam,
      value: 'VIETNAM',
      label: 'Vietnam',
      color: 'sky',
      position: 242,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .wallisAndFutuna,
      value: 'WALLIS_AND_FUTUNA',
      label: 'Wallis And Futuna',
      color: 'blue',
      position: 243,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .westernSahara,
      value: 'WESTERN_SAHARA',
      label: 'Western Sahara',
      color: 'purple',
      position: 244,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.yemen,
      value: 'YEMEN',
      label: 'Yemen',
      color: 'pink',
      position: 245,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry.zambia,
      value: 'ZAMBIA',
      label: 'Zambia',
      color: 'red',
      position: 246,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .zimbabwe,
      value: 'ZIMBABWE',
      label: 'Zimbabwe',
      color: 'orange',
      position: 247,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationCountry
        .alandIslands,
      value: 'ALAND_ISLANDS',
      label: 'Åland Islands',
      color: 'yellow',
      position: 248,
    },
  ],
});
