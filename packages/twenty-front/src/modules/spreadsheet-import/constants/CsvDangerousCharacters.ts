// Characters that can trigger CSV injection when they appear at the start of a cell.
// Based on OWASP CSV Injection guidelines: https://owasp.org/www-community/attacks/CSV_Injection
export const CSV_DANGEROUS_CHARACTERS = /^[=+\-@\t\r]/;
