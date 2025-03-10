const generateAuthorizationHa1 = async (username: string, password: string, domain: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}:${domain}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
  return hashBase64.substring(0, 22);
};

export default generateAuthorizationHa1;