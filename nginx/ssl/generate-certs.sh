#!/bin/bash

# Generate self-signed SSL certificates for Twenty CRM

CERT_DIR="$(dirname "$0")"
DOMAIN="localhost"
DAYS=365

echo "Generating self-signed SSL certificate for $DOMAIN..."

MSYS_NO_PATHCONV=1 openssl req -x509 -nodes -days $DAYS \
    -newkey rsa:2048 \
    -keyout "$CERT_DIR/twenty.key" \
    -out "$CERT_DIR/twenty.crt" \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

if [ $? -eq 0 ]; then
    echo "✓ Certificate generated successfully!"
    echo "  Key: $CERT_DIR/twenty.key"
    echo "  Certificate: $CERT_DIR/twenty.crt"
    echo "  Valid for: $DAYS days"
else
    echo "✗ Certificate generation failed!"
    exit 1
fi
