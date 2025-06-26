// Test cases for phone number validation with extension support

const phoneNumberTestCases = [
  // Valid cases
  { input: '1234567890', expected: true, description: 'Plain phone number' },
  { input: '123-456-7890', expected: true, description: 'Phone with dashes' },
  { input: '(123) 456-7890', expected: true, description: 'Phone with parentheses' },
  { input: '+1 234 567 8900', expected: true, description: 'Phone with country code' },
  { input: '1234567890,123', expected: true, description: 'Phone with comma extension' },
  { input: '1234567890#123', expected: true, description: 'Phone with pound extension' },
  { input: '+886 2 1234 5678,123', expected: true, description: 'International with comma extension' },
  { input: '+886 2 1234 5678#123', expected: true, description: 'International with pound extension' },
  { input: '(123) 456-7890,1234', expected: true, description: 'Formatted phone with comma extension' },
  { input: '(123) 456-7890#1234', expected: true, description: 'Formatted phone with pound extension' },
  { input: '', expected: true, description: 'Empty string should be valid' },
  
  // Invalid cases
  { input: 'abc123', expected: false, description: 'Letters in phone number' },
  { input: '123@456', expected: false, description: 'Invalid character @' },
  { input: '123.456.7890', expected: false, description: 'Dots not allowed' },
  { input: '123*456', expected: false, description: 'Asterisk not allowed' },
];

// Phone number validation regex that allows digits, spaces, hyphens, parentheses, plus sign, comma, and pound sign
const phoneNumberPattern = /^[\d\s\-\(\)\+\,\#]*$/;

const isValidPhoneNumberInput = (value: string): boolean => {
  if (value === '') return true;
  return phoneNumberPattern.test(value);
};

// Run tests
console.log('Phone Number Validation Tests:');
console.log('==============================');

phoneNumberTestCases.forEach(({ input, expected, description }) => {
  const result = isValidPhoneNumberInput(input);
  const status = result === expected ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${description}: "${input}" -> ${result}`);
});

export { isValidPhoneNumberInput, phoneNumberTestCases };