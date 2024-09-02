export const getAddressSubField = (label: string) => {
  switch (label) {
    case 'Address 1':
      return 'addressStreet1';
    case 'Address 2':
      return 'addressStreet2';
    case 'City':
      return 'addressCity';
    case 'State':
      return 'addressState';
    case 'Country':
      return 'addressCountry';
    case 'Post Code':
      return 'addressPostcode';
    default:
      throw new Error(`Unknown address subfield label ${label}`);
  }
};

export const getFullNameSubField = (label: string) => {
  switch (label) {
    case 'First Name':
      return 'firstName';
    case 'Last Name':
      return 'lastName';
    default:
      throw new Error(`Unknown full name subfield label ${label}`);
  }
};

export const getLinkSubField = (label: string) => {
  switch (label) {
    case 'Link URL':
      return 'primaryLinkUrl';
    case 'Link Label':
      return 'primaryLinkLabel';
    default:
      throw new Error(`Unknown link subfield label ${label}`);
  }
};
