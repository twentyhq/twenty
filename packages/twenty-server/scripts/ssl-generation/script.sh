#!/bin/bash

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null
then
    echo "OpenSSL is not installed. Please install it before running this script."
    exit
fi

# Default values
DOMAIN=${1:-localhost.com}
ROOT_CERT_NAME=${2:-myRootCertificate}
VALIDITY_DAYS=${3:-398} # Default is 825 days

CERTS_DIR=~/certs/$DOMAIN

# Create a directory to store the certificates
mkdir -p $CERTS_DIR
cd $CERTS_DIR

# Generate the private key for the Certificate Authority (CA)
openssl genrsa -aes256 -out ${ROOT_CERT_NAME}.key 2048

# Generate the root certificate for the CA
openssl req -x509 -new -nodes -key ${ROOT_CERT_NAME}.key -sha256 -days $VALIDITY_DAYS -out ${ROOT_CERT_NAME}.pem \
    -subj "/C=US/ST=State/L=City/O=MyOrg/OU=MyUnit/CN=MyLocalCA"

# Add the root certificate to the macOS keychain (requires admin password)
if [[ "$OSTYPE" == "darwin"* ]]; then
    sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" ${ROOT_CERT_NAME}.pem
fi

# Generate the private key for the provided domain
openssl genrsa -out $DOMAIN.key 2048

# Create a Certificate Signing Request (CSR) for the provided domain
openssl req -new -key $DOMAIN.key -out $DOMAIN.csr \
    -subj "/C=US/ST=State/L=City/O=MyOrg/OU=MyUnit/CN=*.$DOMAIN"

# Create a configuration file for certificate extensions
cat > $DOMAIN.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
EOF

# Sign the certificate with the CA
openssl x509 -req -in $DOMAIN.csr -CA ${ROOT_CERT_NAME}.pem -CAkey ${ROOT_CERT_NAME}.key -CAcreateserial \
    -out $DOMAIN.crt -days $VALIDITY_DAYS -sha256 -extfile $DOMAIN.ext

echo "Certificates generated in the directory $CERTS_DIR:"
echo "- Root certificate: ${ROOT_CERT_NAME}.pem"
echo "- Domain private key: $DOMAIN.key"
echo "- Signed certificate: $DOMAIN.crt"

# Tips for usage
echo "To use these certificates with a local server, configure your server to use $DOMAIN.crt and $DOMAIN.key."