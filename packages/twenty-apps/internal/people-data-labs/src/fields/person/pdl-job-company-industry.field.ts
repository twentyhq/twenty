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
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlJobCompanyIndustry,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlJobCompanyIndustry',
  label: 'Current Company Industry',
  description:
    'Current company canonical industry returned by People Data Labs.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .accounting,
      value: 'ACCOUNTING',
      label: 'Accounting',
      color: 'green',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .airlinesAviation,
      value: 'AIRLINES_AVIATION',
      label: 'Airlines/Aviation',
      color: 'turquoise',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .alternativeDisputeResolution,
      value: 'ALTERNATIVE_DISPUTE_RESOLUTION',
      label: 'Alternative Dispute Resolution',
      color: 'sky',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .alternativeMedicine,
      value: 'ALTERNATIVE_MEDICINE',
      label: 'Alternative Medicine',
      color: 'blue',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .animation,
      value: 'ANIMATION',
      label: 'Animation',
      color: 'purple',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .apparelFashion,
      value: 'APPAREL_FASHION',
      label: 'Apparel & Fashion',
      color: 'pink',
      position: 5,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .architecturePlanning,
      value: 'ARCHITECTURE_PLANNING',
      label: 'Architecture & Planning',
      color: 'red',
      position: 6,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .artsAndCrafts,
      value: 'ARTS_AND_CRAFTS',
      label: 'Arts And Crafts',
      color: 'orange',
      position: 7,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .automotive,
      value: 'AUTOMOTIVE',
      label: 'Automotive',
      color: 'yellow',
      position: 8,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .aviationAerospace,
      value: 'AVIATION_AEROSPACE',
      label: 'Aviation & Aerospace',
      color: 'gray',
      position: 9,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .banking,
      value: 'BANKING',
      label: 'Banking',
      color: 'green',
      position: 10,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .biotechnology,
      value: 'BIOTECHNOLOGY',
      label: 'Biotechnology',
      color: 'turquoise',
      position: 11,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .broadcastMedia,
      value: 'BROADCAST_MEDIA',
      label: 'Broadcast Media',
      color: 'sky',
      position: 12,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .buildingMaterials,
      value: 'BUILDING_MATERIALS',
      label: 'Building Materials',
      color: 'blue',
      position: 13,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .businessSuppliesAndEquipment,
      value: 'BUSINESS_SUPPLIES_AND_EQUIPMENT',
      label: 'Business Supplies And Equipment',
      color: 'purple',
      position: 14,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .capitalMarkets,
      value: 'CAPITAL_MARKETS',
      label: 'Capital Markets',
      color: 'pink',
      position: 15,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .chemicals,
      value: 'CHEMICALS',
      label: 'Chemicals',
      color: 'red',
      position: 16,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .civicSocialOrganization,
      value: 'CIVIC_SOCIAL_ORGANIZATION',
      label: 'Civic & Social Organization',
      color: 'orange',
      position: 17,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .civilEngineering,
      value: 'CIVIL_ENGINEERING',
      label: 'Civil Engineering',
      color: 'yellow',
      position: 18,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .commercialRealEstate,
      value: 'COMMERCIAL_REAL_ESTATE',
      label: 'Commercial Real Estate',
      color: 'gray',
      position: 19,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .computerNetworkSecurity,
      value: 'COMPUTER_NETWORK_SECURITY',
      label: 'Computer & Network Security',
      color: 'green',
      position: 20,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .computerGames,
      value: 'COMPUTER_GAMES',
      label: 'Computer Games',
      color: 'turquoise',
      position: 21,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .computerHardware,
      value: 'COMPUTER_HARDWARE',
      label: 'Computer Hardware',
      color: 'sky',
      position: 22,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .computerNetworking,
      value: 'COMPUTER_NETWORKING',
      label: 'Computer Networking',
      color: 'blue',
      position: 23,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .computerSoftware,
      value: 'COMPUTER_SOFTWARE',
      label: 'Computer Software',
      color: 'purple',
      position: 24,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .construction,
      value: 'CONSTRUCTION',
      label: 'Construction',
      color: 'pink',
      position: 25,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .consumerElectronics,
      value: 'CONSUMER_ELECTRONICS',
      label: 'Consumer Electronics',
      color: 'red',
      position: 26,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .consumerGoods,
      value: 'CONSUMER_GOODS',
      label: 'Consumer Goods',
      color: 'orange',
      position: 27,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .consumerServices,
      value: 'CONSUMER_SERVICES',
      label: 'Consumer Services',
      color: 'yellow',
      position: 28,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .cosmetics,
      value: 'COSMETICS',
      label: 'Cosmetics',
      color: 'gray',
      position: 29,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .dairy,
      value: 'DAIRY',
      label: 'Dairy',
      color: 'green',
      position: 30,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .defenseSpace,
      value: 'DEFENSE_SPACE',
      label: 'Defense & Space',
      color: 'turquoise',
      position: 31,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .design,
      value: 'DESIGN',
      label: 'Design',
      color: 'sky',
      position: 32,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .eLearning,
      value: 'E_LEARNING',
      label: 'E-Learning',
      color: 'blue',
      position: 33,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .educationManagement,
      value: 'EDUCATION_MANAGEMENT',
      label: 'Education Management',
      color: 'purple',
      position: 34,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .electricalElectronicManufacturing,
      value: 'ELECTRICAL_ELECTRONIC_MANUFACTURING',
      label: 'Electrical/Electronic Manufacturing',
      color: 'pink',
      position: 35,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .entertainment,
      value: 'ENTERTAINMENT',
      label: 'Entertainment',
      color: 'red',
      position: 36,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .environmentalServices,
      value: 'ENVIRONMENTAL_SERVICES',
      label: 'Environmental Services',
      color: 'orange',
      position: 37,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .eventsServices,
      value: 'EVENTS_SERVICES',
      label: 'Events Services',
      color: 'yellow',
      position: 38,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .executiveOffice,
      value: 'EXECUTIVE_OFFICE',
      label: 'Executive Office',
      color: 'gray',
      position: 39,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .facilitiesServices,
      value: 'FACILITIES_SERVICES',
      label: 'Facilities Services',
      color: 'green',
      position: 40,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .farming,
      value: 'FARMING',
      label: 'Farming',
      color: 'turquoise',
      position: 41,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .financialServices,
      value: 'FINANCIAL_SERVICES',
      label: 'Financial Services',
      color: 'sky',
      position: 42,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .fineArt,
      value: 'FINE_ART',
      label: 'Fine Art',
      color: 'blue',
      position: 43,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .fishery,
      value: 'FISHERY',
      label: 'Fishery',
      color: 'purple',
      position: 44,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .foodBeverages,
      value: 'FOOD_BEVERAGES',
      label: 'Food & Beverages',
      color: 'pink',
      position: 45,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .foodProduction,
      value: 'FOOD_PRODUCTION',
      label: 'Food Production',
      color: 'red',
      position: 46,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .fundRaising,
      value: 'FUND_RAISING',
      label: 'Fund-Raising',
      color: 'orange',
      position: 47,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .furniture,
      value: 'FURNITURE',
      label: 'Furniture',
      color: 'yellow',
      position: 48,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .gamblingCasinos,
      value: 'GAMBLING_CASINOS',
      label: 'Gambling & Casinos',
      color: 'gray',
      position: 49,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .glassCeramicsConcrete,
      value: 'GLASS_CERAMICS_CONCRETE',
      label: 'Glass Ceramics & Concrete',
      color: 'green',
      position: 50,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .governmentAdministration,
      value: 'GOVERNMENT_ADMINISTRATION',
      label: 'Government Administration',
      color: 'turquoise',
      position: 51,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .governmentRelations,
      value: 'GOVERNMENT_RELATIONS',
      label: 'Government Relations',
      color: 'sky',
      position: 52,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .graphicDesign,
      value: 'GRAPHIC_DESIGN',
      label: 'Graphic Design',
      color: 'blue',
      position: 53,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .healthWellnessAndFitness,
      value: 'HEALTH_WELLNESS_AND_FITNESS',
      label: 'Health Wellness And Fitness',
      color: 'purple',
      position: 54,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .higherEducation,
      value: 'HIGHER_EDUCATION',
      label: 'Higher Education',
      color: 'pink',
      position: 55,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .hospitalHealthCare,
      value: 'HOSPITAL_HEALTH_CARE',
      label: 'Hospital & Health Care',
      color: 'red',
      position: 56,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .hospitality,
      value: 'HOSPITALITY',
      label: 'Hospitality',
      color: 'orange',
      position: 57,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .humanResources,
      value: 'HUMAN_RESOURCES',
      label: 'Human Resources',
      color: 'yellow',
      position: 58,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .importAndExport,
      value: 'IMPORT_AND_EXPORT',
      label: 'Import And Export',
      color: 'gray',
      position: 59,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .individualFamilyServices,
      value: 'INDIVIDUAL_FAMILY_SERVICES',
      label: 'Individual & Family Services',
      color: 'green',
      position: 60,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .industrialAutomation,
      value: 'INDUSTRIAL_AUTOMATION',
      label: 'Industrial Automation',
      color: 'turquoise',
      position: 61,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .informationServices,
      value: 'INFORMATION_SERVICES',
      label: 'Information Services',
      color: 'sky',
      position: 62,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .informationTechnologyAndServices,
      value: 'INFORMATION_TECHNOLOGY_AND_SERVICES',
      label: 'Information Technology And Services',
      color: 'blue',
      position: 63,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .insurance,
      value: 'INSURANCE',
      label: 'Insurance',
      color: 'purple',
      position: 64,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .internationalAffairs,
      value: 'INTERNATIONAL_AFFAIRS',
      label: 'International Affairs',
      color: 'pink',
      position: 65,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .internationalTradeAndDevelopment,
      value: 'INTERNATIONAL_TRADE_AND_DEVELOPMENT',
      label: 'International Trade And Development',
      color: 'red',
      position: 66,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .internet,
      value: 'INTERNET',
      label: 'Internet',
      color: 'orange',
      position: 67,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .investmentBanking,
      value: 'INVESTMENT_BANKING',
      label: 'Investment Banking',
      color: 'yellow',
      position: 68,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .investmentManagement,
      value: 'INVESTMENT_MANAGEMENT',
      label: 'Investment Management',
      color: 'gray',
      position: 69,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .judiciary,
      value: 'JUDICIARY',
      label: 'Judiciary',
      color: 'green',
      position: 70,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .lawEnforcement,
      value: 'LAW_ENFORCEMENT',
      label: 'Law Enforcement',
      color: 'turquoise',
      position: 71,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .lawPractice,
      value: 'LAW_PRACTICE',
      label: 'Law Practice',
      color: 'sky',
      position: 72,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .legalServices,
      value: 'LEGAL_SERVICES',
      label: 'Legal Services',
      color: 'blue',
      position: 73,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .legislativeOffice,
      value: 'LEGISLATIVE_OFFICE',
      label: 'Legislative Office',
      color: 'purple',
      position: 74,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .leisureTravelTourism,
      value: 'LEISURE_TRAVEL_TOURISM',
      label: 'Leisure Travel & Tourism',
      color: 'pink',
      position: 75,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .libraries,
      value: 'LIBRARIES',
      label: 'Libraries',
      color: 'red',
      position: 76,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .logisticsAndSupplyChain,
      value: 'LOGISTICS_AND_SUPPLY_CHAIN',
      label: 'Logistics And Supply Chain',
      color: 'orange',
      position: 77,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .luxuryGoodsJewelry,
      value: 'LUXURY_GOODS_JEWELRY',
      label: 'Luxury Goods & Jewelry',
      color: 'yellow',
      position: 78,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .machinery,
      value: 'MACHINERY',
      label: 'Machinery',
      color: 'gray',
      position: 79,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .managementConsulting,
      value: 'MANAGEMENT_CONSULTING',
      label: 'Management Consulting',
      color: 'green',
      position: 80,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .maritime,
      value: 'MARITIME',
      label: 'Maritime',
      color: 'turquoise',
      position: 81,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .marketResearch,
      value: 'MARKET_RESEARCH',
      label: 'Market Research',
      color: 'sky',
      position: 82,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .marketingAndAdvertising,
      value: 'MARKETING_AND_ADVERTISING',
      label: 'Marketing And Advertising',
      color: 'blue',
      position: 83,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .mechanicalOrIndustrialEngineering,
      value: 'MECHANICAL_OR_INDUSTRIAL_ENGINEERING',
      label: 'Mechanical Or Industrial Engineering',
      color: 'purple',
      position: 84,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .mediaProduction,
      value: 'MEDIA_PRODUCTION',
      label: 'Media Production',
      color: 'pink',
      position: 85,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .medicalDevices,
      value: 'MEDICAL_DEVICES',
      label: 'Medical Devices',
      color: 'red',
      position: 86,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .medicalPractice,
      value: 'MEDICAL_PRACTICE',
      label: 'Medical Practice',
      color: 'orange',
      position: 87,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .mentalHealthCare,
      value: 'MENTAL_HEALTH_CARE',
      label: 'Mental Health Care',
      color: 'yellow',
      position: 88,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .military,
      value: 'MILITARY',
      label: 'Military',
      color: 'gray',
      position: 89,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .miningMetals,
      value: 'MINING_METALS',
      label: 'Mining & Metals',
      color: 'green',
      position: 90,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .motionPicturesAndFilm,
      value: 'MOTION_PICTURES_AND_FILM',
      label: 'Motion Pictures And Film',
      color: 'turquoise',
      position: 91,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .museumsAndInstitutions,
      value: 'MUSEUMS_AND_INSTITUTIONS',
      label: 'Museums And Institutions',
      color: 'sky',
      position: 92,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .music,
      value: 'MUSIC',
      label: 'Music',
      color: 'blue',
      position: 93,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .nanotechnology,
      value: 'NANOTECHNOLOGY',
      label: 'Nanotechnology',
      color: 'purple',
      position: 94,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .newspapers,
      value: 'NEWSPAPERS',
      label: 'Newspapers',
      color: 'pink',
      position: 95,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .nonProfitOrganizationManagement,
      value: 'NON_PROFIT_ORGANIZATION_MANAGEMENT',
      label: 'Non-Profit Organization Management',
      color: 'red',
      position: 96,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .oilEnergy,
      value: 'OIL_ENERGY',
      label: 'Oil & Energy',
      color: 'orange',
      position: 97,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .onlineMedia,
      value: 'ONLINE_MEDIA',
      label: 'Online Media',
      color: 'yellow',
      position: 98,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .outsourcingOffshoring,
      value: 'OUTSOURCING_OFFSHORING',
      label: 'Outsourcing/Offshoring',
      color: 'gray',
      position: 99,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .packageFreightDelivery,
      value: 'PACKAGE_FREIGHT_DELIVERY',
      label: 'Package/Freight Delivery',
      color: 'green',
      position: 100,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .packagingAndContainers,
      value: 'PACKAGING_AND_CONTAINERS',
      label: 'Packaging And Containers',
      color: 'turquoise',
      position: 101,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .paperForestProducts,
      value: 'PAPER_FOREST_PRODUCTS',
      label: 'Paper & Forest Products',
      color: 'sky',
      position: 102,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .performingArts,
      value: 'PERFORMING_ARTS',
      label: 'Performing Arts',
      color: 'blue',
      position: 103,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .pharmaceuticals,
      value: 'PHARMACEUTICALS',
      label: 'Pharmaceuticals',
      color: 'purple',
      position: 104,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .philanthropy,
      value: 'PHILANTHROPY',
      label: 'Philanthropy',
      color: 'pink',
      position: 105,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .photography,
      value: 'PHOTOGRAPHY',
      label: 'Photography',
      color: 'red',
      position: 106,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .plastics,
      value: 'PLASTICS',
      label: 'Plastics',
      color: 'orange',
      position: 107,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .politicalOrganization,
      value: 'POLITICAL_ORGANIZATION',
      label: 'Political Organization',
      color: 'yellow',
      position: 108,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .primarySecondaryEducation,
      value: 'PRIMARY_SECONDARY_EDUCATION',
      label: 'Primary/Secondary Education',
      color: 'gray',
      position: 109,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .printing,
      value: 'PRINTING',
      label: 'Printing',
      color: 'green',
      position: 110,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .professionalTrainingCoaching,
      value: 'PROFESSIONAL_TRAINING_COACHING',
      label: 'Professional Training & Coaching',
      color: 'turquoise',
      position: 111,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .programDevelopment,
      value: 'PROGRAM_DEVELOPMENT',
      label: 'Program Development',
      color: 'sky',
      position: 112,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .publicPolicy,
      value: 'PUBLIC_POLICY',
      label: 'Public Policy',
      color: 'blue',
      position: 113,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .publicRelationsAndCommunications,
      value: 'PUBLIC_RELATIONS_AND_COMMUNICATIONS',
      label: 'Public Relations And Communications',
      color: 'purple',
      position: 114,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .publicSafety,
      value: 'PUBLIC_SAFETY',
      label: 'Public Safety',
      color: 'pink',
      position: 115,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .publishing,
      value: 'PUBLISHING',
      label: 'Publishing',
      color: 'red',
      position: 116,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .railroadManufacture,
      value: 'RAILROAD_MANUFACTURE',
      label: 'Railroad Manufacture',
      color: 'orange',
      position: 117,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .ranching,
      value: 'RANCHING',
      label: 'Ranching',
      color: 'yellow',
      position: 118,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .realEstate,
      value: 'REAL_ESTATE',
      label: 'Real Estate',
      color: 'gray',
      position: 119,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .recreationalFacilitiesAndServices,
      value: 'RECREATIONAL_FACILITIES_AND_SERVICES',
      label: 'Recreational Facilities And Services',
      color: 'green',
      position: 120,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .religiousInstitutions,
      value: 'RELIGIOUS_INSTITUTIONS',
      label: 'Religious Institutions',
      color: 'turquoise',
      position: 121,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .renewablesEnvironment,
      value: 'RENEWABLES_ENVIRONMENT',
      label: 'Renewables & Environment',
      color: 'sky',
      position: 122,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .research,
      value: 'RESEARCH',
      label: 'Research',
      color: 'blue',
      position: 123,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .restaurants,
      value: 'RESTAURANTS',
      label: 'Restaurants',
      color: 'purple',
      position: 124,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .retail,
      value: 'RETAIL',
      label: 'Retail',
      color: 'pink',
      position: 125,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .securityAndInvestigations,
      value: 'SECURITY_AND_INVESTIGATIONS',
      label: 'Security And Investigations',
      color: 'red',
      position: 126,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .semiconductors,
      value: 'SEMICONDUCTORS',
      label: 'Semiconductors',
      color: 'orange',
      position: 127,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .shipbuilding,
      value: 'SHIPBUILDING',
      label: 'Shipbuilding',
      color: 'yellow',
      position: 128,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .sportingGoods,
      value: 'SPORTING_GOODS',
      label: 'Sporting Goods',
      color: 'gray',
      position: 129,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .sports,
      value: 'SPORTS',
      label: 'Sports',
      color: 'green',
      position: 130,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .staffingAndRecruiting,
      value: 'STAFFING_AND_RECRUITING',
      label: 'Staffing And Recruiting',
      color: 'turquoise',
      position: 131,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .supermarkets,
      value: 'SUPERMARKETS',
      label: 'Supermarkets',
      color: 'sky',
      position: 132,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .telecommunications,
      value: 'TELECOMMUNICATIONS',
      label: 'Telecommunications',
      color: 'blue',
      position: 133,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .textiles,
      value: 'TEXTILES',
      label: 'Textiles',
      color: 'purple',
      position: 134,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .thinkTanks,
      value: 'THINK_TANKS',
      label: 'Think Tanks',
      color: 'pink',
      position: 135,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .tobacco,
      value: 'TOBACCO',
      label: 'Tobacco',
      color: 'red',
      position: 136,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .translationAndLocalization,
      value: 'TRANSLATION_AND_LOCALIZATION',
      label: 'Translation And Localization',
      color: 'orange',
      position: 137,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .transportationTruckingRailroad,
      value: 'TRANSPORTATION_TRUCKING_RAILROAD',
      label: 'Transportation/Trucking/Railroad',
      color: 'yellow',
      position: 138,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .utilities,
      value: 'UTILITIES',
      label: 'Utilities',
      color: 'gray',
      position: 139,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .ventureCapitalPrivateEquity,
      value: 'VENTURE_CAPITAL_PRIVATE_EQUITY',
      label: 'Venture Capital & Private Equity',
      color: 'green',
      position: 140,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .veterinary,
      value: 'VETERINARY',
      label: 'Veterinary',
      color: 'turquoise',
      position: 141,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .warehousing,
      value: 'WAREHOUSING',
      label: 'Warehousing',
      color: 'sky',
      position: 142,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .wholesale,
      value: 'WHOLESALE',
      label: 'Wholesale',
      color: 'blue',
      position: 143,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .wineAndSpirits,
      value: 'WINE_AND_SPIRITS',
      label: 'Wine And Spirits',
      color: 'purple',
      position: 144,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .wireless,
      value: 'WIRELESS',
      label: 'Wireless',
      color: 'pink',
      position: 145,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry
        .writingAndEditing,
      value: 'WRITING_AND_EDITING',
      label: 'Writing And Editing',
      color: 'red',
      position: 146,
    },
  ],
});
