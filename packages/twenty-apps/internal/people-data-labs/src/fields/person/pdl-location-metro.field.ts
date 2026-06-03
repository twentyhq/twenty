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
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlLocationMetro,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlLocationMetro',
  label: 'Metro Area',
  description: 'People Data Labs canonical metro area.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .abileneTexas,
      value: 'ABILENE_TEXAS',
      label: 'Abilene, Texas',
      color: 'green',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro.akronOhio,
      value: 'AKRON_OHIO',
      label: 'Akron, Ohio',
      color: 'turquoise',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .albanyGeorgia,
      value: 'ALBANY_GEORGIA',
      label: 'Albany, Georgia',
      color: 'sky',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .albanyNewYork,
      value: 'ALBANY_NEW_YORK',
      label: 'Albany, New York',
      color: 'blue',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .albanyOregon,
      value: 'ALBANY_OREGON',
      label: 'Albany, Oregon',
      color: 'purple',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .albuquerqueNewMexico,
      value: 'ALBUQUERQUE_NEW_MEXICO',
      label: 'Albuquerque, New Mexico',
      color: 'pink',
      position: 5,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .alexandriaLouisiana,
      value: 'ALEXANDRIA_LOUISIANA',
      label: 'Alexandria, Louisiana',
      color: 'red',
      position: 6,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .allentownPennsylvania,
      value: 'ALLENTOWN_PENNSYLVANIA',
      label: 'Allentown, Pennsylvania',
      color: 'orange',
      position: 7,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .altoonaPennsylvania,
      value: 'ALTOONA_PENNSYLVANIA',
      label: 'Altoona, Pennsylvania',
      color: 'yellow',
      position: 8,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .amarilloTexas,
      value: 'AMARILLO_TEXAS',
      label: 'Amarillo, Texas',
      color: 'gray',
      position: 9,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro.amesIowa,
      value: 'AMES_IOWA',
      label: 'Ames, Iowa',
      color: 'green',
      position: 10,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .anchorageAlaska,
      value: 'ANCHORAGE_ALASKA',
      label: 'Anchorage, Alaska',
      color: 'turquoise',
      position: 11,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .annArborMichigan,
      value: 'ANN_ARBOR_MICHIGAN',
      label: 'Ann Arbor, Michigan',
      color: 'sky',
      position: 12,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .annistonAlabama,
      value: 'ANNISTON_ALABAMA',
      label: 'Anniston, Alabama',
      color: 'blue',
      position: 13,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .appletonWisconsin,
      value: 'APPLETON_WISCONSIN',
      label: 'Appleton, Wisconsin',
      color: 'purple',
      position: 14,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .ashevilleNorthCarolina,
      value: 'ASHEVILLE_NORTH_CAROLINA',
      label: 'Asheville, North Carolina',
      color: 'pink',
      position: 15,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .athensGeorgia,
      value: 'ATHENS_GEORGIA',
      label: 'Athens, Georgia',
      color: 'red',
      position: 16,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .atlantaGeorgia,
      value: 'ATLANTA_GEORGIA',
      label: 'Atlanta, Georgia',
      color: 'orange',
      position: 17,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .atlanticCityNewJersey,
      value: 'ATLANTIC_CITY_NEW_JERSEY',
      label: 'Atlantic City, New Jersey',
      color: 'yellow',
      position: 18,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .auburnAlabama,
      value: 'AUBURN_ALABAMA',
      label: 'Auburn, Alabama',
      color: 'gray',
      position: 19,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .augustaGeorgia,
      value: 'AUGUSTA_GEORGIA',
      label: 'Augusta, Georgia',
      color: 'green',
      position: 20,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .austinTexas,
      value: 'AUSTIN_TEXAS',
      label: 'Austin, Texas',
      color: 'turquoise',
      position: 21,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bakersfieldCalifornia,
      value: 'BAKERSFIELD_CALIFORNIA',
      label: 'Bakersfield, California',
      color: 'sky',
      position: 22,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .baltimoreMaryland,
      value: 'BALTIMORE_MARYLAND',
      label: 'Baltimore, Maryland',
      color: 'blue',
      position: 23,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bangorMaine,
      value: 'BANGOR_MAINE',
      label: 'Bangor, Maine',
      color: 'purple',
      position: 24,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .barnstableTownMassachusetts,
      value: 'BARNSTABLE_TOWN_MASSACHUSETTS',
      label: 'Barnstable Town, Massachusetts',
      color: 'pink',
      position: 25,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .batonRougeLouisiana,
      value: 'BATON_ROUGE_LOUISIANA',
      label: 'Baton Rouge, Louisiana',
      color: 'red',
      position: 26,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .battleCreekMichigan,
      value: 'BATTLE_CREEK_MICHIGAN',
      label: 'Battle Creek, Michigan',
      color: 'orange',
      position: 27,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bayCityMichigan,
      value: 'BAY_CITY_MICHIGAN',
      label: 'Bay City, Michigan',
      color: 'yellow',
      position: 28,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .beaumontTexas,
      value: 'BEAUMONT_TEXAS',
      label: 'Beaumont, Texas',
      color: 'gray',
      position: 29,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .beckleyWestVirginia,
      value: 'BECKLEY_WEST_VIRGINIA',
      label: 'Beckley, West Virginia',
      color: 'green',
      position: 30,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bellinghamWashington,
      value: 'BELLINGHAM_WASHINGTON',
      label: 'Bellingham, Washington',
      color: 'turquoise',
      position: 31,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bendOregon,
      value: 'BEND_OREGON',
      label: 'Bend, Oregon',
      color: 'sky',
      position: 32,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .billingsMontana,
      value: 'BILLINGS_MONTANA',
      label: 'Billings, Montana',
      color: 'blue',
      position: 33,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .binghamtonNewYork,
      value: 'BINGHAMTON_NEW_YORK',
      label: 'Binghamton, New York',
      color: 'purple',
      position: 34,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .birminghamAlabama,
      value: 'BIRMINGHAM_ALABAMA',
      label: 'Birmingham, Alabama',
      color: 'pink',
      position: 35,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bismarckNorthDakota,
      value: 'BISMARCK_NORTH_DAKOTA',
      label: 'Bismarck, North Dakota',
      color: 'red',
      position: 36,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .blacksburgVirginia,
      value: 'BLACKSBURG_VIRGINIA',
      label: 'Blacksburg, Virginia',
      color: 'orange',
      position: 37,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bloomingtonIllinois,
      value: 'BLOOMINGTON_ILLINOIS',
      label: 'Bloomington, Illinois',
      color: 'yellow',
      position: 38,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bloomingtonIndiana,
      value: 'BLOOMINGTON_INDIANA',
      label: 'Bloomington, Indiana',
      color: 'gray',
      position: 39,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bloomsburgPennsylvania,
      value: 'BLOOMSBURG_PENNSYLVANIA',
      label: 'Bloomsburg, Pennsylvania',
      color: 'green',
      position: 40,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .boiseCityIdaho,
      value: 'BOISE_CITY_IDAHO',
      label: 'Boise City, Idaho',
      color: 'turquoise',
      position: 41,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bostonMassachusetts,
      value: 'BOSTON_MASSACHUSETTS',
      label: 'Boston, Massachusetts',
      color: 'sky',
      position: 42,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .boulderColorado,
      value: 'BOULDER_COLORADO',
      label: 'Boulder, Colorado',
      color: 'blue',
      position: 43,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bowlingGreenKentucky,
      value: 'BOWLING_GREEN_KENTUCKY',
      label: 'Bowling Green, Kentucky',
      color: 'purple',
      position: 44,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bremertonWashington,
      value: 'BREMERTON_WASHINGTON',
      label: 'Bremerton, Washington',
      color: 'pink',
      position: 45,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .bridgeportConnecticut,
      value: 'BRIDGEPORT_CONNECTICUT',
      label: 'Bridgeport, Connecticut',
      color: 'red',
      position: 46,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .brownsvilleTexas,
      value: 'BROWNSVILLE_TEXAS',
      label: 'Brownsville, Texas',
      color: 'orange',
      position: 47,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .brunswickGeorgia,
      value: 'BRUNSWICK_GEORGIA',
      label: 'Brunswick, Georgia',
      color: 'yellow',
      position: 48,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .buffaloNewYork,
      value: 'BUFFALO_NEW_YORK',
      label: 'Buffalo, New York',
      color: 'gray',
      position: 49,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .burlingtonNorthCarolina,
      value: 'BURLINGTON_NORTH_CAROLINA',
      label: 'Burlington, North Carolina',
      color: 'green',
      position: 50,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .burlingtonVermont,
      value: 'BURLINGTON_VERMONT',
      label: 'Burlington, Vermont',
      color: 'turquoise',
      position: 51,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .californiaMaryland,
      value: 'CALIFORNIA_MARYLAND',
      label: 'California, Maryland',
      color: 'sky',
      position: 52,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .cantonOhio,
      value: 'CANTON_OHIO',
      label: 'Canton, Ohio',
      color: 'blue',
      position: 53,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .capeCoralFlorida,
      value: 'CAPE_CORAL_FLORIDA',
      label: 'Cape Coral, Florida',
      color: 'purple',
      position: 54,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .capeGirardeauMissouri,
      value: 'CAPE_GIRARDEAU_MISSOURI',
      label: 'Cape Girardeau, Missouri',
      color: 'pink',
      position: 55,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .carbondaleIllinois,
      value: 'CARBONDALE_ILLINOIS',
      label: 'Carbondale, Illinois',
      color: 'red',
      position: 56,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .carsonCityNevada,
      value: 'CARSON_CITY_NEVADA',
      label: 'Carson City, Nevada',
      color: 'orange',
      position: 57,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .casperWyoming,
      value: 'CASPER_WYOMING',
      label: 'Casper, Wyoming',
      color: 'yellow',
      position: 58,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .cedarRapidsIowa,
      value: 'CEDAR_RAPIDS_IOWA',
      label: 'Cedar Rapids, Iowa',
      color: 'gray',
      position: 59,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .chambersburgPennsylvania,
      value: 'CHAMBERSBURG_PENNSYLVANIA',
      label: 'Chambersburg, Pennsylvania',
      color: 'green',
      position: 60,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .champaignIllinois,
      value: 'CHAMPAIGN_ILLINOIS',
      label: 'Champaign, Illinois',
      color: 'turquoise',
      position: 61,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .charlestonSouthCarolina,
      value: 'CHARLESTON_SOUTH_CAROLINA',
      label: 'Charleston, South Carolina',
      color: 'sky',
      position: 62,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .charlestonWestVirginia,
      value: 'CHARLESTON_WEST_VIRGINIA',
      label: 'Charleston, West Virginia',
      color: 'blue',
      position: 63,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .charlotteNorthCarolina,
      value: 'CHARLOTTE_NORTH_CAROLINA',
      label: 'Charlotte, North Carolina',
      color: 'purple',
      position: 64,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .charlottesvilleVirginia,
      value: 'CHARLOTTESVILLE_VIRGINIA',
      label: 'Charlottesville, Virginia',
      color: 'pink',
      position: 65,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .chattanoogaTennessee,
      value: 'CHATTANOOGA_TENNESSEE',
      label: 'Chattanooga, Tennessee',
      color: 'red',
      position: 66,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .cheyenneWyoming,
      value: 'CHEYENNE_WYOMING',
      label: 'Cheyenne, Wyoming',
      color: 'orange',
      position: 67,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .chicagoIllinois,
      value: 'CHICAGO_ILLINOIS',
      label: 'Chicago, Illinois',
      color: 'yellow',
      position: 68,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .chicoCalifornia,
      value: 'CHICO_CALIFORNIA',
      label: 'Chico, California',
      color: 'gray',
      position: 69,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .cincinnatiOhio,
      value: 'CINCINNATI_OHIO',
      label: 'Cincinnati, Ohio',
      color: 'green',
      position: 70,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .clarksvilleTennessee,
      value: 'CLARKSVILLE_TENNESSEE',
      label: 'Clarksville, Tennessee',
      color: 'turquoise',
      position: 71,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .clevelandOhio,
      value: 'CLEVELAND_OHIO',
      label: 'Cleveland, Ohio',
      color: 'sky',
      position: 72,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .clevelandTennessee,
      value: 'CLEVELAND_TENNESSEE',
      label: 'Cleveland, Tennessee',
      color: 'blue',
      position: 73,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .coeurDAleneIdaho,
      value: 'COEUR_D_ALENE_IDAHO',
      label: "Coeur D'Alene, Idaho",
      color: 'purple',
      position: 74,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .collegeStationTexas,
      value: 'COLLEGE_STATION_TEXAS',
      label: 'College Station, Texas',
      color: 'pink',
      position: 75,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .coloradoSpringsColorado,
      value: 'COLORADO_SPRINGS_COLORADO',
      label: 'Colorado Springs, Colorado',
      color: 'red',
      position: 76,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .columbiaMissouri,
      value: 'COLUMBIA_MISSOURI',
      label: 'Columbia, Missouri',
      color: 'orange',
      position: 77,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .columbiaSouthCarolina,
      value: 'COLUMBIA_SOUTH_CAROLINA',
      label: 'Columbia, South Carolina',
      color: 'yellow',
      position: 78,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .columbusGeorgia,
      value: 'COLUMBUS_GEORGIA',
      label: 'Columbus, Georgia',
      color: 'gray',
      position: 79,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .columbusIndiana,
      value: 'COLUMBUS_INDIANA',
      label: 'Columbus, Indiana',
      color: 'green',
      position: 80,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .columbusOhio,
      value: 'COLUMBUS_OHIO',
      label: 'Columbus, Ohio',
      color: 'turquoise',
      position: 81,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .corpusChristiTexas,
      value: 'CORPUS_CHRISTI_TEXAS',
      label: 'Corpus Christi, Texas',
      color: 'sky',
      position: 82,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .corvallisOregon,
      value: 'CORVALLIS_OREGON',
      label: 'Corvallis, Oregon',
      color: 'blue',
      position: 83,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .crestviewFlorida,
      value: 'CRESTVIEW_FLORIDA',
      label: 'Crestview, Florida',
      color: 'purple',
      position: 84,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .cumberlandMaryland,
      value: 'CUMBERLAND_MARYLAND',
      label: 'Cumberland, Maryland',
      color: 'pink',
      position: 85,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .dallasTexas,
      value: 'DALLAS_TEXAS',
      label: 'Dallas, Texas',
      color: 'red',
      position: 86,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .daltonGeorgia,
      value: 'DALTON_GEORGIA',
      label: 'Dalton, Georgia',
      color: 'orange',
      position: 87,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .danvilleIllinois,
      value: 'DANVILLE_ILLINOIS',
      label: 'Danville, Illinois',
      color: 'yellow',
      position: 88,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .daphneAlabama,
      value: 'DAPHNE_ALABAMA',
      label: 'Daphne, Alabama',
      color: 'gray',
      position: 89,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .davenportIowa,
      value: 'DAVENPORT_IOWA',
      label: 'Davenport, Iowa',
      color: 'green',
      position: 90,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .daytonOhio,
      value: 'DAYTON_OHIO',
      label: 'Dayton, Ohio',
      color: 'turquoise',
      position: 91,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .decaturAlabama,
      value: 'DECATUR_ALABAMA',
      label: 'Decatur, Alabama',
      color: 'sky',
      position: 92,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .decaturIllinois,
      value: 'DECATUR_ILLINOIS',
      label: 'Decatur, Illinois',
      color: 'blue',
      position: 93,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .deltonaFlorida,
      value: 'DELTONA_FLORIDA',
      label: 'Deltona, Florida',
      color: 'purple',
      position: 94,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .denverColorado,
      value: 'DENVER_COLORADO',
      label: 'Denver, Colorado',
      color: 'pink',
      position: 95,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .desMoinesIowa,
      value: 'DES_MOINES_IOWA',
      label: 'Des Moines, Iowa',
      color: 'red',
      position: 96,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .detroitMichigan,
      value: 'DETROIT_MICHIGAN',
      label: 'Detroit, Michigan',
      color: 'orange',
      position: 97,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .districtOfColumbia,
      value: 'DISTRICT_OF_COLUMBIA',
      label: 'District Of Columbia',
      color: 'yellow',
      position: 98,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .dothanAlabama,
      value: 'DOTHAN_ALABAMA',
      label: 'Dothan, Alabama',
      color: 'gray',
      position: 99,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .doverDelaware,
      value: 'DOVER_DELAWARE',
      label: 'Dover, Delaware',
      color: 'green',
      position: 100,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .dubuqueIowa,
      value: 'DUBUQUE_IOWA',
      label: 'Dubuque, Iowa',
      color: 'turquoise',
      position: 101,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .duluthMinnesota,
      value: 'DULUTH_MINNESOTA',
      label: 'Duluth, Minnesota',
      color: 'sky',
      position: 102,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .durhamNorthCarolina,
      value: 'DURHAM_NORTH_CAROLINA',
      label: 'Durham, North Carolina',
      color: 'blue',
      position: 103,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .eastStroudsburgPennsylvania,
      value: 'EAST_STROUDSBURG_PENNSYLVANIA',
      label: 'East Stroudsburg, Pennsylvania',
      color: 'purple',
      position: 104,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .eauClaireWisconsin,
      value: 'EAU_CLAIRE_WISCONSIN',
      label: 'Eau Claire, Wisconsin',
      color: 'pink',
      position: 105,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .elCentroCalifornia,
      value: 'EL_CENTRO_CALIFORNIA',
      label: 'El Centro, California',
      color: 'red',
      position: 106,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .elPasoTexas,
      value: 'EL_PASO_TEXAS',
      label: 'El Paso, Texas',
      color: 'orange',
      position: 107,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .elizabethtownKentucky,
      value: 'ELIZABETHTOWN_KENTUCKY',
      label: 'Elizabethtown, Kentucky',
      color: 'yellow',
      position: 108,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .elkhartIndiana,
      value: 'ELKHART_INDIANA',
      label: 'Elkhart, Indiana',
      color: 'gray',
      position: 109,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .elmiraNewYork,
      value: 'ELMIRA_NEW_YORK',
      label: 'Elmira, New York',
      color: 'green',
      position: 110,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .enidOklahoma,
      value: 'ENID_OKLAHOMA',
      label: 'Enid, Oklahoma',
      color: 'turquoise',
      position: 111,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .eriePennsylvania,
      value: 'ERIE_PENNSYLVANIA',
      label: 'Erie, Pennsylvania',
      color: 'sky',
      position: 112,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .eugeneOregon,
      value: 'EUGENE_OREGON',
      label: 'Eugene, Oregon',
      color: 'blue',
      position: 113,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .evansvilleIndiana,
      value: 'EVANSVILLE_INDIANA',
      label: 'Evansville, Indiana',
      color: 'purple',
      position: 114,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fairbanksAlaska,
      value: 'FAIRBANKS_ALASKA',
      label: 'Fairbanks, Alaska',
      color: 'pink',
      position: 115,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fargoNorthDakota,
      value: 'FARGO_NORTH_DAKOTA',
      label: 'Fargo, North Dakota',
      color: 'red',
      position: 116,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .farmingtonNewMexico,
      value: 'FARMINGTON_NEW_MEXICO',
      label: 'Farmington, New Mexico',
      color: 'orange',
      position: 117,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fayettevilleArkansas,
      value: 'FAYETTEVILLE_ARKANSAS',
      label: 'Fayetteville, Arkansas',
      color: 'yellow',
      position: 118,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fayettevilleNorthCarolina,
      value: 'FAYETTEVILLE_NORTH_CAROLINA',
      label: 'Fayetteville, North Carolina',
      color: 'gray',
      position: 119,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .flagstaffArizona,
      value: 'FLAGSTAFF_ARIZONA',
      label: 'Flagstaff, Arizona',
      color: 'green',
      position: 120,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .flintMichigan,
      value: 'FLINT_MICHIGAN',
      label: 'Flint, Michigan',
      color: 'turquoise',
      position: 121,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .florenceAlabama,
      value: 'FLORENCE_ALABAMA',
      label: 'Florence, Alabama',
      color: 'sky',
      position: 122,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .florenceSouthCarolina,
      value: 'FLORENCE_SOUTH_CAROLINA',
      label: 'Florence, South Carolina',
      color: 'blue',
      position: 123,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fondDuLacWisconsin,
      value: 'FOND_DU_LAC_WISCONSIN',
      label: 'Fond Du Lac, Wisconsin',
      color: 'purple',
      position: 124,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fortCollinsColorado,
      value: 'FORT_COLLINS_COLORADO',
      label: 'Fort Collins, Colorado',
      color: 'pink',
      position: 125,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fortSmithArkansas,
      value: 'FORT_SMITH_ARKANSAS',
      label: 'Fort Smith, Arkansas',
      color: 'red',
      position: 126,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fortWayneIndiana,
      value: 'FORT_WAYNE_INDIANA',
      label: 'Fort Wayne, Indiana',
      color: 'orange',
      position: 127,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .fresnoCalifornia,
      value: 'FRESNO_CALIFORNIA',
      label: 'Fresno, California',
      color: 'yellow',
      position: 128,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .gadsdenAlabama,
      value: 'GADSDEN_ALABAMA',
      label: 'Gadsden, Alabama',
      color: 'gray',
      position: 129,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .gainesvilleFlorida,
      value: 'GAINESVILLE_FLORIDA',
      label: 'Gainesville, Florida',
      color: 'green',
      position: 130,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .gainesvilleGeorgia,
      value: 'GAINESVILLE_GEORGIA',
      label: 'Gainesville, Georgia',
      color: 'turquoise',
      position: 131,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .gettysburgPennsylvania,
      value: 'GETTYSBURG_PENNSYLVANIA',
      label: 'Gettysburg, Pennsylvania',
      color: 'sky',
      position: 132,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .glensFallsNewYork,
      value: 'GLENS_FALLS_NEW_YORK',
      label: 'Glens Falls, New York',
      color: 'blue',
      position: 133,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .goldsboroNorthCarolina,
      value: 'GOLDSBORO_NORTH_CAROLINA',
      label: 'Goldsboro, North Carolina',
      color: 'purple',
      position: 134,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .grandForksNorthDakota,
      value: 'GRAND_FORKS_NORTH_DAKOTA',
      label: 'Grand Forks, North Dakota',
      color: 'pink',
      position: 135,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .grandIslandNebraska,
      value: 'GRAND_ISLAND_NEBRASKA',
      label: 'Grand Island, Nebraska',
      color: 'red',
      position: 136,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .grandJunctionColorado,
      value: 'GRAND_JUNCTION_COLORADO',
      label: 'Grand Junction, Colorado',
      color: 'orange',
      position: 137,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .grandRapidsMichigan,
      value: 'GRAND_RAPIDS_MICHIGAN',
      label: 'Grand Rapids, Michigan',
      color: 'yellow',
      position: 138,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .grantsPassOregon,
      value: 'GRANTS_PASS_OREGON',
      label: 'Grants Pass, Oregon',
      color: 'gray',
      position: 139,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .greatFallsMontana,
      value: 'GREAT_FALLS_MONTANA',
      label: 'Great Falls, Montana',
      color: 'green',
      position: 140,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .greeleyColorado,
      value: 'GREELEY_COLORADO',
      label: 'Greeley, Colorado',
      color: 'turquoise',
      position: 141,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .greenBayWisconsin,
      value: 'GREEN_BAY_WISCONSIN',
      label: 'Green Bay, Wisconsin',
      color: 'sky',
      position: 142,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .greensboroNorthCarolina,
      value: 'GREENSBORO_NORTH_CAROLINA',
      label: 'Greensboro, North Carolina',
      color: 'blue',
      position: 143,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .greenvilleNorthCarolina,
      value: 'GREENVILLE_NORTH_CAROLINA',
      label: 'Greenville, North Carolina',
      color: 'purple',
      position: 144,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .greenvilleSouthCarolina,
      value: 'GREENVILLE_SOUTH_CAROLINA',
      label: 'Greenville, South Carolina',
      color: 'pink',
      position: 145,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .gulfportMississippi,
      value: 'GULFPORT_MISSISSIPPI',
      label: 'Gulfport, Mississippi',
      color: 'red',
      position: 146,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hagerstownMaryland,
      value: 'HAGERSTOWN_MARYLAND',
      label: 'Hagerstown, Maryland',
      color: 'orange',
      position: 147,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hammondLouisiana,
      value: 'HAMMOND_LOUISIANA',
      label: 'Hammond, Louisiana',
      color: 'yellow',
      position: 148,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hanfordCalifornia,
      value: 'HANFORD_CALIFORNIA',
      label: 'Hanford, California',
      color: 'gray',
      position: 149,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .harrisburgPennsylvania,
      value: 'HARRISBURG_PENNSYLVANIA',
      label: 'Harrisburg, Pennsylvania',
      color: 'green',
      position: 150,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .harrisonburgVirginia,
      value: 'HARRISONBURG_VIRGINIA',
      label: 'Harrisonburg, Virginia',
      color: 'turquoise',
      position: 151,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hartfordConnecticut,
      value: 'HARTFORD_CONNECTICUT',
      label: 'Hartford, Connecticut',
      color: 'sky',
      position: 152,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hattiesburgMississippi,
      value: 'HATTIESBURG_MISSISSIPPI',
      label: 'Hattiesburg, Mississippi',
      color: 'blue',
      position: 153,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hickoryNorthCarolina,
      value: 'HICKORY_NORTH_CAROLINA',
      label: 'Hickory, North Carolina',
      color: 'purple',
      position: 154,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hiltonHeadIslandSouthCarolina,
      value: 'HILTON_HEAD_ISLAND_SOUTH_CAROLINA',
      label: 'Hilton Head Island, South Carolina',
      color: 'pink',
      position: 155,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hinesvilleGeorgia,
      value: 'HINESVILLE_GEORGIA',
      label: 'Hinesville, Georgia',
      color: 'red',
      position: 156,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .homosassaSpringsFlorida,
      value: 'HOMOSASSA_SPRINGS_FLORIDA',
      label: 'Homosassa Springs, Florida',
      color: 'orange',
      position: 157,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .hotSpringsArkansas,
      value: 'HOT_SPRINGS_ARKANSAS',
      label: 'Hot Springs, Arkansas',
      color: 'yellow',
      position: 158,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .houmaLouisiana,
      value: 'HOUMA_LOUISIANA',
      label: 'Houma, Louisiana',
      color: 'gray',
      position: 159,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .houstonTexas,
      value: 'HOUSTON_TEXAS',
      label: 'Houston, Texas',
      color: 'green',
      position: 160,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .huntingtonWestVirginia,
      value: 'HUNTINGTON_WEST_VIRGINIA',
      label: 'Huntington, West Virginia',
      color: 'turquoise',
      position: 161,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .huntsvilleAlabama,
      value: 'HUNTSVILLE_ALABAMA',
      label: 'Huntsville, Alabama',
      color: 'sky',
      position: 162,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .idahoFallsIdaho,
      value: 'IDAHO_FALLS_IDAHO',
      label: 'Idaho Falls, Idaho',
      color: 'blue',
      position: 163,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .indianapolisIndiana,
      value: 'INDIANAPOLIS_INDIANA',
      label: 'Indianapolis, Indiana',
      color: 'purple',
      position: 164,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .iowaCityIowa,
      value: 'IOWA_CITY_IOWA',
      label: 'Iowa City, Iowa',
      color: 'pink',
      position: 165,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .ithacaNewYork,
      value: 'ITHACA_NEW_YORK',
      label: 'Ithaca, New York',
      color: 'red',
      position: 166,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .jacksonMichigan,
      value: 'JACKSON_MICHIGAN',
      label: 'Jackson, Michigan',
      color: 'orange',
      position: 167,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .jacksonMississippi,
      value: 'JACKSON_MISSISSIPPI',
      label: 'Jackson, Mississippi',
      color: 'yellow',
      position: 168,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .jacksonTennessee,
      value: 'JACKSON_TENNESSEE',
      label: 'Jackson, Tennessee',
      color: 'gray',
      position: 169,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .jacksonvilleFlorida,
      value: 'JACKSONVILLE_FLORIDA',
      label: 'Jacksonville, Florida',
      color: 'green',
      position: 170,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .jacksonvilleNorthCarolina,
      value: 'JACKSONVILLE_NORTH_CAROLINA',
      label: 'Jacksonville, North Carolina',
      color: 'turquoise',
      position: 171,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .janesvilleWisconsin,
      value: 'JANESVILLE_WISCONSIN',
      label: 'Janesville, Wisconsin',
      color: 'sky',
      position: 172,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .jeffersonCityMissouri,
      value: 'JEFFERSON_CITY_MISSOURI',
      label: 'Jefferson City, Missouri',
      color: 'blue',
      position: 173,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .johnsonCityTennessee,
      value: 'JOHNSON_CITY_TENNESSEE',
      label: 'Johnson City, Tennessee',
      color: 'purple',
      position: 174,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .johnstownPennsylvania,
      value: 'JOHNSTOWN_PENNSYLVANIA',
      label: 'Johnstown, Pennsylvania',
      color: 'pink',
      position: 175,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .jonesboroArkansas,
      value: 'JONESBORO_ARKANSAS',
      label: 'Jonesboro, Arkansas',
      color: 'red',
      position: 176,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .joplinMissouri,
      value: 'JOPLIN_MISSOURI',
      label: 'Joplin, Missouri',
      color: 'orange',
      position: 177,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .kahuluiHawaii,
      value: 'KAHULUI_HAWAII',
      label: 'Kahului, Hawaii',
      color: 'yellow',
      position: 178,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .kalamazooMichigan,
      value: 'KALAMAZOO_MICHIGAN',
      label: 'Kalamazoo, Michigan',
      color: 'gray',
      position: 179,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .kankakeeIllinois,
      value: 'KANKAKEE_ILLINOIS',
      label: 'Kankakee, Illinois',
      color: 'green',
      position: 180,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .kansasCityMissouri,
      value: 'KANSAS_CITY_MISSOURI',
      label: 'Kansas City, Missouri',
      color: 'turquoise',
      position: 181,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .kennewickWashington,
      value: 'KENNEWICK_WASHINGTON',
      label: 'Kennewick, Washington',
      color: 'sky',
      position: 182,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .killeenTexas,
      value: 'KILLEEN_TEXAS',
      label: 'Killeen, Texas',
      color: 'blue',
      position: 183,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .kingsportTennessee,
      value: 'KINGSPORT_TENNESSEE',
      label: 'Kingsport, Tennessee',
      color: 'purple',
      position: 184,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .kingstonNewYork,
      value: 'KINGSTON_NEW_YORK',
      label: 'Kingston, New York',
      color: 'pink',
      position: 185,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .knoxvilleTennessee,
      value: 'KNOXVILLE_TENNESSEE',
      label: 'Knoxville, Tennessee',
      color: 'red',
      position: 186,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .kokomoIndiana,
      value: 'KOKOMO_INDIANA',
      label: 'Kokomo, Indiana',
      color: 'orange',
      position: 187,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .laCrosseWisconsin,
      value: 'LA_CROSSE_WISCONSIN',
      label: 'La Crosse, Wisconsin',
      color: 'yellow',
      position: 188,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lafayetteIndiana,
      value: 'LAFAYETTE_INDIANA',
      label: 'Lafayette, Indiana',
      color: 'gray',
      position: 189,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lafayetteLouisiana,
      value: 'LAFAYETTE_LOUISIANA',
      label: 'Lafayette, Louisiana',
      color: 'green',
      position: 190,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lakeCharlesLouisiana,
      value: 'LAKE_CHARLES_LOUISIANA',
      label: 'Lake Charles, Louisiana',
      color: 'turquoise',
      position: 191,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lakeHavasuCityArizona,
      value: 'LAKE_HAVASU_CITY_ARIZONA',
      label: 'Lake Havasu City, Arizona',
      color: 'sky',
      position: 192,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lakelandFlorida,
      value: 'LAKELAND_FLORIDA',
      label: 'Lakeland, Florida',
      color: 'blue',
      position: 193,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lancasterPennsylvania,
      value: 'LANCASTER_PENNSYLVANIA',
      label: 'Lancaster, Pennsylvania',
      color: 'purple',
      position: 194,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lansingMichigan,
      value: 'LANSING_MICHIGAN',
      label: 'Lansing, Michigan',
      color: 'pink',
      position: 195,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .laredoTexas,
      value: 'LAREDO_TEXAS',
      label: 'Laredo, Texas',
      color: 'red',
      position: 196,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lasCrucesNewMexico,
      value: 'LAS_CRUCES_NEW_MEXICO',
      label: 'Las Cruces, New Mexico',
      color: 'orange',
      position: 197,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lasVegasNevada,
      value: 'LAS_VEGAS_NEVADA',
      label: 'Las Vegas, Nevada',
      color: 'yellow',
      position: 198,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lawrenceKansas,
      value: 'LAWRENCE_KANSAS',
      label: 'Lawrence, Kansas',
      color: 'gray',
      position: 199,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lawtonOklahoma,
      value: 'LAWTON_OKLAHOMA',
      label: 'Lawton, Oklahoma',
      color: 'green',
      position: 200,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lebanonPennsylvania,
      value: 'LEBANON_PENNSYLVANIA',
      label: 'Lebanon, Pennsylvania',
      color: 'turquoise',
      position: 201,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lewistonIdaho,
      value: 'LEWISTON_IDAHO',
      label: 'Lewiston, Idaho',
      color: 'sky',
      position: 202,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lewistonMaine,
      value: 'LEWISTON_MAINE',
      label: 'Lewiston, Maine',
      color: 'blue',
      position: 203,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lexingtonKentucky,
      value: 'LEXINGTON_KENTUCKY',
      label: 'Lexington, Kentucky',
      color: 'purple',
      position: 204,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro.limaOhio,
      value: 'LIMA_OHIO',
      label: 'Lima, Ohio',
      color: 'pink',
      position: 205,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lincolnNebraska,
      value: 'LINCOLN_NEBRASKA',
      label: 'Lincoln, Nebraska',
      color: 'red',
      position: 206,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .littleRockArkansas,
      value: 'LITTLE_ROCK_ARKANSAS',
      label: 'Little Rock, Arkansas',
      color: 'orange',
      position: 207,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro.loganUtah,
      value: 'LOGAN_UTAH',
      label: 'Logan, Utah',
      color: 'yellow',
      position: 208,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .longviewTexas,
      value: 'LONGVIEW_TEXAS',
      label: 'Longview, Texas',
      color: 'gray',
      position: 209,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .longviewWashington,
      value: 'LONGVIEW_WASHINGTON',
      label: 'Longview, Washington',
      color: 'green',
      position: 210,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .losAngelesCalifornia,
      value: 'LOS_ANGELES_CALIFORNIA',
      label: 'Los Angeles, California',
      color: 'turquoise',
      position: 211,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .louisvilleKentucky,
      value: 'LOUISVILLE_KENTUCKY',
      label: 'Louisville, Kentucky',
      color: 'sky',
      position: 212,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lubbockTexas,
      value: 'LUBBOCK_TEXAS',
      label: 'Lubbock, Texas',
      color: 'blue',
      position: 213,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .lynchburgVirginia,
      value: 'LYNCHBURG_VIRGINIA',
      label: 'Lynchburg, Virginia',
      color: 'purple',
      position: 214,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .maconGeorgia,
      value: 'MACON_GEORGIA',
      label: 'Macon, Georgia',
      color: 'pink',
      position: 215,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .maderaCalifornia,
      value: 'MADERA_CALIFORNIA',
      label: 'Madera, California',
      color: 'red',
      position: 216,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .madisonWisconsin,
      value: 'MADISON_WISCONSIN',
      label: 'Madison, Wisconsin',
      color: 'orange',
      position: 217,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .manchesterNewHampshire,
      value: 'MANCHESTER_NEW_HAMPSHIRE',
      label: 'Manchester, New Hampshire',
      color: 'yellow',
      position: 218,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .manhattanKansas,
      value: 'MANHATTAN_KANSAS',
      label: 'Manhattan, Kansas',
      color: 'gray',
      position: 219,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .mankatoMinnesota,
      value: 'MANKATO_MINNESOTA',
      label: 'Mankato, Minnesota',
      color: 'green',
      position: 220,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .mansfieldOhio,
      value: 'MANSFIELD_OHIO',
      label: 'Mansfield, Ohio',
      color: 'turquoise',
      position: 221,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .mcallenTexas,
      value: 'MCALLEN_TEXAS',
      label: 'Mcallen, Texas',
      color: 'sky',
      position: 222,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .medfordOregon,
      value: 'MEDFORD_OREGON',
      label: 'Medford, Oregon',
      color: 'blue',
      position: 223,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .memphisTennessee,
      value: 'MEMPHIS_TENNESSEE',
      label: 'Memphis, Tennessee',
      color: 'purple',
      position: 224,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .mercedCalifornia,
      value: 'MERCED_CALIFORNIA',
      label: 'Merced, California',
      color: 'pink',
      position: 225,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .miamiFlorida,
      value: 'MIAMI_FLORIDA',
      label: 'Miami, Florida',
      color: 'red',
      position: 226,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .michiganCityIndiana,
      value: 'MICHIGAN_CITY_INDIANA',
      label: 'Michigan City, Indiana',
      color: 'orange',
      position: 227,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .midlandMichigan,
      value: 'MIDLAND_MICHIGAN',
      label: 'Midland, Michigan',
      color: 'yellow',
      position: 228,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .midlandTexas,
      value: 'MIDLAND_TEXAS',
      label: 'Midland, Texas',
      color: 'gray',
      position: 229,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .milwaukeeWisconsin,
      value: 'MILWAUKEE_WISCONSIN',
      label: 'Milwaukee, Wisconsin',
      color: 'green',
      position: 230,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .minneapolisMinnesota,
      value: 'MINNEAPOLIS_MINNESOTA',
      label: 'Minneapolis, Minnesota',
      color: 'turquoise',
      position: 231,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .missoulaMontana,
      value: 'MISSOULA_MONTANA',
      label: 'Missoula, Montana',
      color: 'sky',
      position: 232,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .mobileAlabama,
      value: 'MOBILE_ALABAMA',
      label: 'Mobile, Alabama',
      color: 'blue',
      position: 233,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .modestoCalifornia,
      value: 'MODESTO_CALIFORNIA',
      label: 'Modesto, California',
      color: 'purple',
      position: 234,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .monroeLouisiana,
      value: 'MONROE_LOUISIANA',
      label: 'Monroe, Louisiana',
      color: 'pink',
      position: 235,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .monroeMichigan,
      value: 'MONROE_MICHIGAN',
      label: 'Monroe, Michigan',
      color: 'red',
      position: 236,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .montgomeryAlabama,
      value: 'MONTGOMERY_ALABAMA',
      label: 'Montgomery, Alabama',
      color: 'orange',
      position: 237,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .morgantownWestVirginia,
      value: 'MORGANTOWN_WEST_VIRGINIA',
      label: 'Morgantown, West Virginia',
      color: 'yellow',
      position: 238,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .morristownTennessee,
      value: 'MORRISTOWN_TENNESSEE',
      label: 'Morristown, Tennessee',
      color: 'gray',
      position: 239,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .mountVernonWashington,
      value: 'MOUNT_VERNON_WASHINGTON',
      label: 'Mount Vernon, Washington',
      color: 'green',
      position: 240,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .muncieIndiana,
      value: 'MUNCIE_INDIANA',
      label: 'Muncie, Indiana',
      color: 'turquoise',
      position: 241,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .muskegonMichigan,
      value: 'MUSKEGON_MICHIGAN',
      label: 'Muskegon, Michigan',
      color: 'sky',
      position: 242,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .myrtleBeachSouthCarolina,
      value: 'MYRTLE_BEACH_SOUTH_CAROLINA',
      label: 'Myrtle Beach, South Carolina',
      color: 'blue',
      position: 243,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .napaCalifornia,
      value: 'NAPA_CALIFORNIA',
      label: 'Napa, California',
      color: 'purple',
      position: 244,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .naplesFlorida,
      value: 'NAPLES_FLORIDA',
      label: 'Naples, Florida',
      color: 'pink',
      position: 245,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .nashvilleTennessee,
      value: 'NASHVILLE_TENNESSEE',
      label: 'Nashville, Tennessee',
      color: 'red',
      position: 246,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .newBernNorthCarolina,
      value: 'NEW_BERN_NORTH_CAROLINA',
      label: 'New Bern, North Carolina',
      color: 'orange',
      position: 247,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .newHavenConnecticut,
      value: 'NEW_HAVEN_CONNECTICUT',
      label: 'New Haven, Connecticut',
      color: 'yellow',
      position: 248,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .newOrleansLouisiana,
      value: 'NEW_ORLEANS_LOUISIANA',
      label: 'New Orleans, Louisiana',
      color: 'gray',
      position: 249,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .newYorkNewYork,
      value: 'NEW_YORK_NEW_YORK',
      label: 'New York, New York',
      color: 'green',
      position: 250,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .nilesMichigan,
      value: 'NILES_MICHIGAN',
      label: 'Niles, Michigan',
      color: 'turquoise',
      position: 251,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .northPortFlorida,
      value: 'NORTH_PORT_FLORIDA',
      label: 'North Port, Florida',
      color: 'sky',
      position: 252,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .norwichConnecticut,
      value: 'NORWICH_CONNECTICUT',
      label: 'Norwich, Connecticut',
      color: 'blue',
      position: 253,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .ocalaFlorida,
      value: 'OCALA_FLORIDA',
      label: 'Ocala, Florida',
      color: 'purple',
      position: 254,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .oceanCityNewJersey,
      value: 'OCEAN_CITY_NEW_JERSEY',
      label: 'Ocean City, New Jersey',
      color: 'pink',
      position: 255,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .odessaTexas,
      value: 'ODESSA_TEXAS',
      label: 'Odessa, Texas',
      color: 'red',
      position: 256,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro.ogdenUtah,
      value: 'OGDEN_UTAH',
      label: 'Ogden, Utah',
      color: 'orange',
      position: 257,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .oklahomaCityOklahoma,
      value: 'OKLAHOMA_CITY_OKLAHOMA',
      label: 'Oklahoma City, Oklahoma',
      color: 'yellow',
      position: 258,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .olympiaWashington,
      value: 'OLYMPIA_WASHINGTON',
      label: 'Olympia, Washington',
      color: 'gray',
      position: 259,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .omahaNebraska,
      value: 'OMAHA_NEBRASKA',
      label: 'Omaha, Nebraska',
      color: 'green',
      position: 260,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .orlandoFlorida,
      value: 'ORLANDO_FLORIDA',
      label: 'Orlando, Florida',
      color: 'turquoise',
      position: 261,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .oshkoshWisconsin,
      value: 'OSHKOSH_WISCONSIN',
      label: 'Oshkosh, Wisconsin',
      color: 'sky',
      position: 262,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .owensboroKentucky,
      value: 'OWENSBORO_KENTUCKY',
      label: 'Owensboro, Kentucky',
      color: 'blue',
      position: 263,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .oxnardCalifornia,
      value: 'OXNARD_CALIFORNIA',
      label: 'Oxnard, California',
      color: 'purple',
      position: 264,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .palmBayFlorida,
      value: 'PALM_BAY_FLORIDA',
      label: 'Palm Bay, Florida',
      color: 'pink',
      position: 265,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .panamaCityFlorida,
      value: 'PANAMA_CITY_FLORIDA',
      label: 'Panama City, Florida',
      color: 'red',
      position: 266,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .parkersburgWestVirginia,
      value: 'PARKERSBURG_WEST_VIRGINIA',
      label: 'Parkersburg, West Virginia',
      color: 'orange',
      position: 267,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .pensacolaFlorida,
      value: 'PENSACOLA_FLORIDA',
      label: 'Pensacola, Florida',
      color: 'yellow',
      position: 268,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .peoriaIllinois,
      value: 'PEORIA_ILLINOIS',
      label: 'Peoria, Illinois',
      color: 'gray',
      position: 269,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .philadelphiaPennsylvania,
      value: 'PHILADELPHIA_PENNSYLVANIA',
      label: 'Philadelphia, Pennsylvania',
      color: 'green',
      position: 270,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .phoenixArizona,
      value: 'PHOENIX_ARIZONA',
      label: 'Phoenix, Arizona',
      color: 'turquoise',
      position: 271,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .pineBluffArkansas,
      value: 'PINE_BLUFF_ARKANSAS',
      label: 'Pine Bluff, Arkansas',
      color: 'sky',
      position: 272,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .pittsburghPennsylvania,
      value: 'PITTSBURGH_PENNSYLVANIA',
      label: 'Pittsburgh, Pennsylvania',
      color: 'blue',
      position: 273,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .pittsfieldMassachusetts,
      value: 'PITTSFIELD_MASSACHUSETTS',
      label: 'Pittsfield, Massachusetts',
      color: 'purple',
      position: 274,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .pocatelloIdaho,
      value: 'POCATELLO_IDAHO',
      label: 'Pocatello, Idaho',
      color: 'pink',
      position: 275,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .portStLucieFlorida,
      value: 'PORT_ST_LUCIE_FLORIDA',
      label: 'Port St. Lucie, Florida',
      color: 'red',
      position: 276,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .portlandMaine,
      value: 'PORTLAND_MAINE',
      label: 'Portland, Maine',
      color: 'orange',
      position: 277,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .portlandOregon,
      value: 'PORTLAND_OREGON',
      label: 'Portland, Oregon',
      color: 'yellow',
      position: 278,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .poughkeepsieNewYork,
      value: 'POUGHKEEPSIE_NEW_YORK',
      label: 'Poughkeepsie, New York',
      color: 'gray',
      position: 279,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .prescottValleyArizona,
      value: 'PRESCOTT_VALLEY_ARIZONA',
      label: 'Prescott Valley, Arizona',
      color: 'green',
      position: 280,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .providenceRhodeIsland,
      value: 'PROVIDENCE_RHODE_ISLAND',
      label: 'Providence, Rhode Island',
      color: 'turquoise',
      position: 281,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro.provoUtah,
      value: 'PROVO_UTAH',
      label: 'Provo, Utah',
      color: 'sky',
      position: 282,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .puebloColorado,
      value: 'PUEBLO_COLORADO',
      label: 'Pueblo, Colorado',
      color: 'blue',
      position: 283,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .puntaGordaFlorida,
      value: 'PUNTA_GORDA_FLORIDA',
      label: 'Punta Gorda, Florida',
      color: 'purple',
      position: 284,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .racineWisconsin,
      value: 'RACINE_WISCONSIN',
      label: 'Racine, Wisconsin',
      color: 'pink',
      position: 285,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .raleighNorthCarolina,
      value: 'RALEIGH_NORTH_CAROLINA',
      label: 'Raleigh, North Carolina',
      color: 'red',
      position: 286,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .rapidCitySouthDakota,
      value: 'RAPID_CITY_SOUTH_DAKOTA',
      label: 'Rapid City, South Dakota',
      color: 'orange',
      position: 287,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .readingPennsylvania,
      value: 'READING_PENNSYLVANIA',
      label: 'Reading, Pennsylvania',
      color: 'yellow',
      position: 288,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .reddingCalifornia,
      value: 'REDDING_CALIFORNIA',
      label: 'Redding, California',
      color: 'gray',
      position: 289,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .renoNevada,
      value: 'RENO_NEVADA',
      label: 'Reno, Nevada',
      color: 'green',
      position: 290,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .richmondVirginia,
      value: 'RICHMOND_VIRGINIA',
      label: 'Richmond, Virginia',
      color: 'turquoise',
      position: 291,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .riversideCalifornia,
      value: 'RIVERSIDE_CALIFORNIA',
      label: 'Riverside, California',
      color: 'sky',
      position: 292,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .roanokeVirginia,
      value: 'ROANOKE_VIRGINIA',
      label: 'Roanoke, Virginia',
      color: 'blue',
      position: 293,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .rochesterMinnesota,
      value: 'ROCHESTER_MINNESOTA',
      label: 'Rochester, Minnesota',
      color: 'purple',
      position: 294,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .rochesterNewYork,
      value: 'ROCHESTER_NEW_YORK',
      label: 'Rochester, New York',
      color: 'pink',
      position: 295,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .rockfordIllinois,
      value: 'ROCKFORD_ILLINOIS',
      label: 'Rockford, Illinois',
      color: 'red',
      position: 296,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .rockyMountNorthCarolina,
      value: 'ROCKY_MOUNT_NORTH_CAROLINA',
      label: 'Rocky Mount, North Carolina',
      color: 'orange',
      position: 297,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .romeGeorgia,
      value: 'ROME_GEORGIA',
      label: 'Rome, Georgia',
      color: 'yellow',
      position: 298,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sacramentoCalifornia,
      value: 'SACRAMENTO_CALIFORNIA',
      label: 'Sacramento, California',
      color: 'gray',
      position: 299,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .saginawMichigan,
      value: 'SAGINAW_MICHIGAN',
      label: 'Saginaw, Michigan',
      color: 'green',
      position: 300,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .salemOregon,
      value: 'SALEM_OREGON',
      label: 'Salem, Oregon',
      color: 'turquoise',
      position: 301,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .salinasCalifornia,
      value: 'SALINAS_CALIFORNIA',
      label: 'Salinas, California',
      color: 'sky',
      position: 302,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .salisburyMaryland,
      value: 'SALISBURY_MARYLAND',
      label: 'Salisbury, Maryland',
      color: 'blue',
      position: 303,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .saltLakeCityUtah,
      value: 'SALT_LAKE_CITY_UTAH',
      label: 'Salt Lake City, Utah',
      color: 'purple',
      position: 304,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sanAngeloTexas,
      value: 'SAN_ANGELO_TEXAS',
      label: 'San Angelo, Texas',
      color: 'pink',
      position: 305,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sanAntonioTexas,
      value: 'SAN_ANTONIO_TEXAS',
      label: 'San Antonio, Texas',
      color: 'red',
      position: 306,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sanDiegoCalifornia,
      value: 'SAN_DIEGO_CALIFORNIA',
      label: 'San Diego, California',
      color: 'orange',
      position: 307,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sanFranciscoCalifornia,
      value: 'SAN_FRANCISCO_CALIFORNIA',
      label: 'San Francisco, California',
      color: 'yellow',
      position: 308,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sanJoseCalifornia,
      value: 'SAN_JOSE_CALIFORNIA',
      label: 'San Jose, California',
      color: 'gray',
      position: 309,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sanLuisObispoCalifornia,
      value: 'SAN_LUIS_OBISPO_CALIFORNIA',
      label: 'San Luis Obispo, California',
      color: 'green',
      position: 310,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .santaCruzCalifornia,
      value: 'SANTA_CRUZ_CALIFORNIA',
      label: 'Santa Cruz, California',
      color: 'turquoise',
      position: 311,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .santaFeNewMexico,
      value: 'SANTA_FE_NEW_MEXICO',
      label: 'Santa Fe, New Mexico',
      color: 'sky',
      position: 312,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .santaMariaCalifornia,
      value: 'SANTA_MARIA_CALIFORNIA',
      label: 'Santa Maria, California',
      color: 'blue',
      position: 313,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .santaRosaCalifornia,
      value: 'SANTA_ROSA_CALIFORNIA',
      label: 'Santa Rosa, California',
      color: 'purple',
      position: 314,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .savannahGeorgia,
      value: 'SAVANNAH_GEORGIA',
      label: 'Savannah, Georgia',
      color: 'pink',
      position: 315,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .scrantonPennsylvania,
      value: 'SCRANTON_PENNSYLVANIA',
      label: 'Scranton, Pennsylvania',
      color: 'red',
      position: 316,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .seattleWashington,
      value: 'SEATTLE_WASHINGTON',
      label: 'Seattle, Washington',
      color: 'orange',
      position: 317,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sebastianFlorida,
      value: 'SEBASTIAN_FLORIDA',
      label: 'Sebastian, Florida',
      color: 'yellow',
      position: 318,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sebringFlorida,
      value: 'SEBRING_FLORIDA',
      label: 'Sebring, Florida',
      color: 'gray',
      position: 319,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sheboyganWisconsin,
      value: 'SHEBOYGAN_WISCONSIN',
      label: 'Sheboygan, Wisconsin',
      color: 'green',
      position: 320,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .shermanTexas,
      value: 'SHERMAN_TEXAS',
      label: 'Sherman, Texas',
      color: 'turquoise',
      position: 321,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .shreveportLouisiana,
      value: 'SHREVEPORT_LOUISIANA',
      label: 'Shreveport, Louisiana',
      color: 'sky',
      position: 322,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sierraVistaArizona,
      value: 'SIERRA_VISTA_ARIZONA',
      label: 'Sierra Vista, Arizona',
      color: 'blue',
      position: 323,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .siouxCityIowa,
      value: 'SIOUX_CITY_IOWA',
      label: 'Sioux City, Iowa',
      color: 'purple',
      position: 324,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .siouxFallsSouthDakota,
      value: 'SIOUX_FALLS_SOUTH_DAKOTA',
      label: 'Sioux Falls, South Dakota',
      color: 'pink',
      position: 325,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .southBendIndiana,
      value: 'SOUTH_BEND_INDIANA',
      label: 'South Bend, Indiana',
      color: 'red',
      position: 326,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .spartanburgSouthCarolina,
      value: 'SPARTANBURG_SOUTH_CAROLINA',
      label: 'Spartanburg, South Carolina',
      color: 'orange',
      position: 327,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .spokaneWashington,
      value: 'SPOKANE_WASHINGTON',
      label: 'Spokane, Washington',
      color: 'yellow',
      position: 328,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .springfieldIllinois,
      value: 'SPRINGFIELD_ILLINOIS',
      label: 'Springfield, Illinois',
      color: 'gray',
      position: 329,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .springfieldMassachusetts,
      value: 'SPRINGFIELD_MASSACHUSETTS',
      label: 'Springfield, Massachusetts',
      color: 'green',
      position: 330,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .springfieldMissouri,
      value: 'SPRINGFIELD_MISSOURI',
      label: 'Springfield, Missouri',
      color: 'turquoise',
      position: 331,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .springfieldOhio,
      value: 'SPRINGFIELD_OHIO',
      label: 'Springfield, Ohio',
      color: 'sky',
      position: 332,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .stCloudMinnesota,
      value: 'ST_CLOUD_MINNESOTA',
      label: 'St. Cloud, Minnesota',
      color: 'blue',
      position: 333,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .stGeorgeUtah,
      value: 'ST_GEORGE_UTAH',
      label: 'St. George, Utah',
      color: 'purple',
      position: 334,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .stJosephMissouri,
      value: 'ST_JOSEPH_MISSOURI',
      label: 'St. Joseph, Missouri',
      color: 'pink',
      position: 335,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .stLouisMissouri,
      value: 'ST_LOUIS_MISSOURI',
      label: 'St. Louis, Missouri',
      color: 'red',
      position: 336,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .stateCollegePennsylvania,
      value: 'STATE_COLLEGE_PENNSYLVANIA',
      label: 'State College, Pennsylvania',
      color: 'orange',
      position: 337,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .stauntonVirginia,
      value: 'STAUNTON_VIRGINIA',
      label: 'Staunton, Virginia',
      color: 'yellow',
      position: 338,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .stocktonCalifornia,
      value: 'STOCKTON_CALIFORNIA',
      label: 'Stockton, California',
      color: 'gray',
      position: 339,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .sumterSouthCarolina,
      value: 'SUMTER_SOUTH_CAROLINA',
      label: 'Sumter, South Carolina',
      color: 'green',
      position: 340,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .syracuseNewYork,
      value: 'SYRACUSE_NEW_YORK',
      label: 'Syracuse, New York',
      color: 'turquoise',
      position: 341,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .tallahasseeFlorida,
      value: 'TALLAHASSEE_FLORIDA',
      label: 'Tallahassee, Florida',
      color: 'sky',
      position: 342,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .tampaFlorida,
      value: 'TAMPA_FLORIDA',
      label: 'Tampa, Florida',
      color: 'blue',
      position: 343,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .terreHauteIndiana,
      value: 'TERRE_HAUTE_INDIANA',
      label: 'Terre Haute, Indiana',
      color: 'purple',
      position: 344,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .texarkanaTexas,
      value: 'TEXARKANA_TEXAS',
      label: 'Texarkana, Texas',
      color: 'pink',
      position: 345,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .theVillagesFlorida,
      value: 'THE_VILLAGES_FLORIDA',
      label: 'The Villages, Florida',
      color: 'red',
      position: 346,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .toledoOhio,
      value: 'TOLEDO_OHIO',
      label: 'Toledo, Ohio',
      color: 'orange',
      position: 347,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .topekaKansas,
      value: 'TOPEKA_KANSAS',
      label: 'Topeka, Kansas',
      color: 'yellow',
      position: 348,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .trentonNewJersey,
      value: 'TRENTON_NEW_JERSEY',
      label: 'Trenton, New Jersey',
      color: 'gray',
      position: 349,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .tucsonArizona,
      value: 'TUCSON_ARIZONA',
      label: 'Tucson, Arizona',
      color: 'green',
      position: 350,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .tulsaOklahoma,
      value: 'TULSA_OKLAHOMA',
      label: 'Tulsa, Oklahoma',
      color: 'turquoise',
      position: 351,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .tuscaloosaAlabama,
      value: 'TUSCALOOSA_ALABAMA',
      label: 'Tuscaloosa, Alabama',
      color: 'sky',
      position: 352,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .twinFallsIdaho,
      value: 'TWIN_FALLS_IDAHO',
      label: 'Twin Falls, Idaho',
      color: 'blue',
      position: 353,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .tylerTexas,
      value: 'TYLER_TEXAS',
      label: 'Tyler, Texas',
      color: 'purple',
      position: 354,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .urbanHonoluluHawaii,
      value: 'URBAN_HONOLULU_HAWAII',
      label: 'Urban Honolulu, Hawaii',
      color: 'pink',
      position: 355,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .uticaNewYork,
      value: 'UTICA_NEW_YORK',
      label: 'Utica, New York',
      color: 'red',
      position: 356,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .valdostaGeorgia,
      value: 'VALDOSTA_GEORGIA',
      label: 'Valdosta, Georgia',
      color: 'orange',
      position: 357,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .vallejoCalifornia,
      value: 'VALLEJO_CALIFORNIA',
      label: 'Vallejo, California',
      color: 'yellow',
      position: 358,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .victoriaTexas,
      value: 'VICTORIA_TEXAS',
      label: 'Victoria, Texas',
      color: 'gray',
      position: 359,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .vinelandNewJersey,
      value: 'VINELAND_NEW_JERSEY',
      label: 'Vineland, New Jersey',
      color: 'green',
      position: 360,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .virginiaBeachVirginia,
      value: 'VIRGINIA_BEACH_VIRGINIA',
      label: 'Virginia Beach, Virginia',
      color: 'turquoise',
      position: 361,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .visaliaCalifornia,
      value: 'VISALIA_CALIFORNIA',
      label: 'Visalia, California',
      color: 'sky',
      position: 362,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro.wacoTexas,
      value: 'WACO_TEXAS',
      label: 'Waco, Texas',
      color: 'blue',
      position: 363,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .wallaWallaWashington,
      value: 'WALLA_WALLA_WASHINGTON',
      label: 'Walla Walla, Washington',
      color: 'purple',
      position: 364,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .warnerRobinsGeorgia,
      value: 'WARNER_ROBINS_GEORGIA',
      label: 'Warner Robins, Georgia',
      color: 'pink',
      position: 365,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .waterlooIowa,
      value: 'WATERLOO_IOWA',
      label: 'Waterloo, Iowa',
      color: 'red',
      position: 366,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .watertownNewYork,
      value: 'WATERTOWN_NEW_YORK',
      label: 'Watertown, New York',
      color: 'orange',
      position: 367,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .wausauWisconsin,
      value: 'WAUSAU_WISCONSIN',
      label: 'Wausau, Wisconsin',
      color: 'yellow',
      position: 368,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .weirtonWestVirginia,
      value: 'WEIRTON_WEST_VIRGINIA',
      label: 'Weirton, West Virginia',
      color: 'gray',
      position: 369,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .wenatcheeWashington,
      value: 'WENATCHEE_WASHINGTON',
      label: 'Wenatchee, Washington',
      color: 'green',
      position: 370,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .wheelingWestVirginia,
      value: 'WHEELING_WEST_VIRGINIA',
      label: 'Wheeling, West Virginia',
      color: 'turquoise',
      position: 371,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .wichitaFallsTexas,
      value: 'WICHITA_FALLS_TEXAS',
      label: 'Wichita Falls, Texas',
      color: 'sky',
      position: 372,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .wichitaKansas,
      value: 'WICHITA_KANSAS',
      label: 'Wichita, Kansas',
      color: 'blue',
      position: 373,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .williamsportPennsylvania,
      value: 'WILLIAMSPORT_PENNSYLVANIA',
      label: 'Williamsport, Pennsylvania',
      color: 'purple',
      position: 374,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .wilmingtonNorthCarolina,
      value: 'WILMINGTON_NORTH_CAROLINA',
      label: 'Wilmington, North Carolina',
      color: 'pink',
      position: 375,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .winchesterVirginia,
      value: 'WINCHESTER_VIRGINIA',
      label: 'Winchester, Virginia',
      color: 'red',
      position: 376,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .winstonNorthCarolina,
      value: 'WINSTON_NORTH_CAROLINA',
      label: 'Winston, North Carolina',
      color: 'orange',
      position: 377,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .worcesterMassachusetts,
      value: 'WORCESTER_MASSACHUSETTS',
      label: 'Worcester, Massachusetts',
      color: 'yellow',
      position: 378,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .yakimaWashington,
      value: 'YAKIMA_WASHINGTON',
      label: 'Yakima, Washington',
      color: 'gray',
      position: 379,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .yorkPennsylvania,
      value: 'YORK_PENNSYLVANIA',
      label: 'York, Pennsylvania',
      color: 'green',
      position: 380,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .youngstownOhio,
      value: 'YOUNGSTOWN_OHIO',
      label: 'Youngstown, Ohio',
      color: 'turquoise',
      position: 381,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .yubaCityCalifornia,
      value: 'YUBA_CITY_CALIFORNIA',
      label: 'Yuba City, California',
      color: 'sky',
      position: 382,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro
        .yumaArizona,
      value: 'YUMA_ARIZONA',
      label: 'Yuma, Arizona',
      color: 'blue',
      position: 383,
    },
  ],
});
